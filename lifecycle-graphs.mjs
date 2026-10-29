const task = (id, role, supervisorRole, purpose, produces, extra = {}) => ({
  id, type: 'task', role, purpose, produces, decisionTraceRequired: true,
  review: { supervisorRole, maxSelfReviews: 5, decisionType: 'review-disposition' }, ...extra
});
const decision = (id, role, decisionType, outcomes, extra = {}) =>
  ({ id, type: 'decision', role, decisionType, outcomes, ...extra });
const join = id => ({ id, type: 'join', mode: 'all' });
const end = (id, output) => ({ id, type: 'end', output });
const edge = (from, to, when) => when === undefined ? { from, to } : { from, to, when };

export const lifecycleGraphs = [
  {
    id: 'request-triage', version: '0.1.0', start: 'assess-request', inputContracts: ['source-request'],
    description: 'Check an issue, external PR or feedback claim before routing it to discovery or implementation; preserve the brief or information gap.',
    nodes: [
      task('assess-request', 'product-owner', 'cpo',
        'Check duplicates, already implemented behavior, prior rejection, and the reported claim. For a bug, reproduce before declaring it ready. Record a durable brief, precise questions or closure reason.',
        ['triage_report'], { requiredInputs: ['source_request'], outputContract: 'triage-report' }),
      decision('triage-disposition', 'product-owner', 'request-triage', ['ready', 'needs-info', 'closed'], {
        requiredInputs: ['triage_report'], candidateNodes: ['assess-request'], candidateKinds: ['triage_report'],
        decisionContract: { type: 'triage-routing', sourceNode: 'assess-request' }
      }),
      end('triage-ready', 'request_ready'), end('triage-needs-info', 'request_needs_info'),
      end('triage-closed', 'request_closed')
    ],
    edges: [
      edge('assess-request', 'triage-disposition'), edge('triage-disposition', 'triage-ready', 'ready'),
      edge('triage-disposition', 'triage-needs-info', 'needs-info'), edge('triage-disposition', 'triage-closed', 'closed')
    ]
  },
  {
    id: 'product-discovery', version: '0.1.1', start: 'frame-discovery', inputContracts: ['triage-handoff-optional'],
    description: 'Investigate the problem and user need before a build commitment; retain an explicit advance, research-more, or no-build disposition.',
    nodes: [
      task('frame-discovery', 'product-owner', 'cpo',
        'Reframe the source request as a problem; identify user groups, research questions, assumptions, constraints, success baseline, and stop criteria.',
        ['discovery_plan'], { requiredInputs: ['source_request'] }),
      task('internal-research', 'internal-product-analyst', 'product-manager',
        'Gather dated usage, support, prior decision, operational and technical constraint evidence; separate observation from inference.',
        ['internal_evidence']),
      task('external-research', 'external-product-analyst', 'product-manager',
        'Gather direct user evidence where access exists, current journey and barriers, contrary signals, and external alternatives; state sample and access limits.',
        ['user_research_record', 'external_evidence']),
      join('evidence-ready'),
      task('synthesize-discovery', 'product-manager', 'cpo',
        'Compare user needs, current alternatives, constraints, baseline and options including no build; draft a versioned intent with open decisions.',
        ['evidence_ledger', 'discovery_options', 'discovery_brief', 'versioned_intent']),
      decision('discovery-gate', 'cpo', 'discovery-disposition', ['advance', 'more-research', 'stop'], {
        requiredInputs: ['discovery_brief', 'versioned_intent'], candidateNodes: ['synthesize-discovery'],
        candidateKinds: ['versioned_intent'], reworkTarget: 'frame-discovery', reworkOutcome: 'more-research', maxReworks: 3
      }),
      end('discovery-advance', 'accepted_intent'), end('discovery-stop', 'no_build_decision')
    ],
    edges: [
      edge('frame-discovery', 'internal-research'), edge('frame-discovery', 'external-research'),
      edge('internal-research', 'evidence-ready'), edge('external-research', 'evidence-ready'),
      edge('evidence-ready', 'synthesize-discovery'), edge('synthesize-discovery', 'discovery-gate'),
      edge('discovery-gate', 'discovery-advance', 'advance'), edge('discovery-gate', 'discovery-stop', 'stop')
    ]
  },
  {
    id: 'release-process', version: '0.1.0', start: 'plan-release',
    description: 'Plan and coordinate a release, then record a named operational start authorization. The host performs the release separately; this graph does not deploy or certify it.',
    nodes: [
      task('plan-release', 'principal-engineer', 'cto-caio',
        'Pin the verified candidate and target, list changes and dependencies, sequence the rollout, name owners, checks, stop conditions, and a recovery path.',
        ['release_plan'], { requiredInputs: ['implementation_candidate', 'verification_decision', 'product_decision_refs'] }),
      task('preflight-release', 'principal-engineer', 'cto-caio',
        'Confirm target access, candidate identity, required configuration, data-change sequencing, observability, and recovery readiness; record unknowns.',
        ['preflight_report']),
      task('coordinate-release', 'product-owner', 'cpo',
        'Record affected users, timing, communication owner, support notice, and a change summary tied to the candidate.',
        ['communication_plan']),
      join('release-ready'),
      decision('release-start', 'cto-caio', 'release-process-start', ['start', 'hold'], {
        requiredInputs: ['release_plan', 'preflight_report', 'communication_plan']
      }),
      end('release-await-execution', 'ready_for_host_execution'), end('release-held', 'release_held')
    ],
    edges: [
      edge('plan-release', 'preflight-release'), edge('plan-release', 'coordinate-release'),
      edge('preflight-release', 'release-ready'), edge('coordinate-release', 'release-ready'),
      edge('release-ready', 'release-start'), edge('release-start', 'release-held', 'hold'),
      edge('release-start', 'release-await-execution', 'start')
    ]
  },
  {
    id: 'release-observation', version: '0.1.0', start: 'record-release-execution',
    description: 'Start only after the host supplies an actual execution event; check the deployed result and record completion, recovery, or investigation.',
    nodes: [
      task('record-release-execution', 'lead-engineer', 'principal-engineer',
        'Record the host-supplied execution event, operator, target, time, candidate, deviations and resulting deployed identity. Compare it with the authorized plan.',
        ['release_execution_record'], { requiredInputs: ['release_execution_event', 'release_plan_identity', 'release_authorization_decision', 'implementation_candidate'] }),
      task('post-release-observation', 'qa-engineer', 'cto-caio',
        'Run target smoke checks and compare user-facing health signals with the pre-release baseline over the stated observation window.',
        ['post_release_report']),
      decision('release-outcome', 'cto-caio', 'release-process-outcome', ['complete', 'recover', 'investigate'], {
        requiredInputs: ['release_execution_record', 'post_release_report'],
        candidateNodes: ['record-release-execution'], candidateKinds: ['release_execution_record']
      }),
      task('request-recovery', 'lead-engineer', 'principal-engineer',
        'Hand the host an authorized recovery request with target known-good state, owner, stop condition and observation check. Record actual recovery only from a later host event.',
        ['recovery_request']),
      task('release-incident-handoff', 'qa-engineer', 'cto-caio',
        'Record the observed symptom, affected users, time window, candidate identity, initial evidence and investigation owner.',
        ['incident_brief']),
      end('release-complete', 'release_recorded'), end('release-recovery', 'recovery_pending'),
      end('release-investigation', 'incident_handoff')
    ],
    edges: [
      edge('record-release-execution', 'post-release-observation'), edge('post-release-observation', 'release-outcome'),
      edge('release-outcome', 'release-complete', 'complete'),
      edge('release-outcome', 'request-recovery', 'recover'), edge('request-recovery', 'release-recovery'),
      edge('release-outcome', 'release-incident-handoff', 'investigate'), edge('release-incident-handoff', 'release-investigation')
    ]
  },
  {
    id: 'production-monitoring', version: '0.1.0', start: 'pin-observation',
    description: 'Evaluate one host-supplied production observation window and route healthy, watch, or investigate; scheduling and telemetry collection remain host responsibilities.',
    nodes: [
      task('pin-observation', 'qa-engineer', 'cto-caio',
        'Pin service, environment, observation window, source and freshness of each signal, and the current deployed candidate when known.',
        ['observation_record'], { requiredInputs: ['service_identity', 'monitoring_plan_identity', 'observation_window', 'signal_snapshot'] }),
      task('assess-health', 'qa-engineer', 'cto-caio',
        'Compare user-facing SLIs or baseline with observed errors, latency, traffic and saturation as applicable; mark missing and stale telemetry.',
        ['health_assessment']),
      decision('monitoring-disposition', 'cto-caio', 'monitoring-triage', ['healthy', 'watch', 'investigate', 'insufficient-data'], {
        requiredInputs: ['observation_record', 'health_assessment'], candidateNodes: ['assess-health'],
        candidateKinds: ['health_assessment']
      }),
      task('record-watch', 'qa-engineer', 'cto-caio',
        'Record the specific signal, threshold, owner and next observation time for a non-urgent but material trend.',
        ['watch_record']),
      task('record-incident', 'qa-engineer', 'cto-caio',
        'Record user impact, first failing signal, time window, deployed candidate, diagnostic links and incident owner; hand off to defect investigation.',
        ['incident_brief']),
      task('record-data-gap', 'qa-engineer', 'cto-caio',
        'Record missing or stale telemetry, the health claims it prevents, an owner, and the next evidence collection action.',
        ['data_gap_record']),
      end('monitoring-healthy', 'healthy_observation'),
      end('monitoring-watch', 'watch_scheduled'),
      end('monitoring-investigation', 'incident_handoff'),
      end('monitoring-unknown', 'health_unverified')
    ],
    edges: [
      edge('pin-observation', 'assess-health'), edge('assess-health', 'monitoring-disposition'),
      edge('monitoring-disposition', 'monitoring-healthy', 'healthy'),
      edge('monitoring-disposition', 'record-watch', 'watch'), edge('record-watch', 'monitoring-watch'),
      edge('monitoring-disposition', 'record-incident', 'investigate'), edge('record-incident', 'monitoring-investigation'),
      edge('monitoring-disposition', 'record-data-gap', 'insufficient-data'), edge('record-data-gap', 'monitoring-unknown')
    ]
  }
];
