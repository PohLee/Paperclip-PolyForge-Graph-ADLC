import test from 'node:test';
import assert from 'node:assert/strict';
import { GraphEngine, readyWorkTickets } from '../../Paperclip-PolyForge-Graph/src/core/index.mjs';
import { pack } from '../index.mjs';
import { roleCatalog, roleResponsibilities } from '../roles/catalog.mjs';

test('published pack registers with the core validator and has the lifecycle inventory', async () => {
  const engine = new GraphEngine();
  await engine.registerPack(pack);
  assert.deepEqual(pack.graphs.map(graph => graph.id), [
    'request-triage', 'product-discovery', 'ui-ux-design', 'implementation', 'verification',
    'release-process', 'release-observation', 'production-monitoring', 'system-architecture', 'code-delivery'
  ]);
  assert.equal(Object.keys(pack.roles).length, 11);
  assert.equal(new Set(pack.graphs.map(graph => `${graph.id}@${graph.version}`)).size, 10);
});

test('every task role and supervisor maps to a documented blueprint', () => {
  const ids = new Set(roleCatalog.map(role => role.id));
  for (const graph of pack.graphs) for (const node of graph.nodes) {
    if (node.role) assert.ok(ids.has(node.role), `${graph.id}/${node.id} uses unknown role ${node.role}`);
    if (node.review) {
      assert.ok(ids.has(node.review.supervisorRole), `${graph.id}/${node.id} has unknown supervisor`);
      assert.equal(node.review.maxSelfReviews, 5);
    }
    if (node.type === 'task' && node.produces?.length) assert.equal(node.decisionTraceRequired, true, `${graph.id}/${node.id} needs a decision trace`);
    for (const author of node.independentOf ?? []) {
      assert.ok(graph.nodes.some(candidate => candidate.id === author), `unknown author ${author}`);
    }
  }
  for (const role of Object.values(pack.roles)) {
    assert.ok(role.supervisorRole === 'human-owner' || ids.has(role.supervisorRole));
    for (const name of ['soul', 'role', 'goal', 'instruction', 'decision_model']) {
      assert.ok(role.documents[name].length > 30, `${role.id}/${name} is missing content`);
      assert.match(role.documentDigests[name], /^[a-f0-9]{64}$/);
    }
    assert.ok(role.skills.length > 0);
    assert.ok(roleResponsibilities[role.id]?.length >= 2);
    for (const duty of roleResponsibilities[role.id]) assert.ok(role.documents.instruction.includes(duty));
    for (const skillId of role.skills) assert.ok(pack.skills[skillId]?.content.length > 100);
  }
});

test('organization has two Board roots and nine specified reporting edges without changing review escalation', () => {
  const reportsTo = {
    cpo: null, 'cto-caio': null,
    'internal-product-analyst': 'cpo', 'external-product-analyst': 'cpo',
    'product-manager': 'cpo', 'product-owner': 'cpo', 'ui-ux-designer-lead': 'cpo',
    'principal-engineer': 'cto-caio', 'lead-engineer': 'cto-caio',
    'qa-engineer': 'cto-caio', 'security-engineer': 'cto-caio'
  };
  const reviewEscalation = {
    cpo: 'human-owner', 'cto-caio': 'human-owner',
    'internal-product-analyst': 'product-manager', 'external-product-analyst': 'product-manager',
    'product-manager': 'cpo', 'product-owner': 'cpo', 'ui-ux-designer-lead': 'cpo',
    'principal-engineer': 'cto-caio', 'lead-engineer': 'principal-engineer',
    'qa-engineer': 'cto-caio', 'security-engineer': 'cto-caio'
  };
  assert.equal(pack.version, '0.1.9');
  assert.deepEqual(Object.fromEntries(Object.values(pack.roles).map(role => [role.id, role.reportsToRole])), reportsTo);
  assert.deepEqual(Object.fromEntries(Object.values(pack.roles).map(role => [role.id, role.supervisorRole])), reviewEscalation);
  assert.equal(Object.values(pack.roles).filter(role => role.reportsToRole === null).length, 2);
  assert.equal(Object.values(pack.roles).filter(role => role.reportsToRole !== null).length, 9);
  for (const role of Object.values(pack.roles)) {
    assert.match(role.documents.role, /## Organization\n\nReports to /);
    assert.match(role.documents.role, /## Artifact review\n\nDefault review escalation role:/);
    assert.match(role.documents.instruction, /organizational reporting line.*Graph node/s);
  }
  assert.deepEqual(pack.graphs.map(graph => graph.version), ['0.1.0', '0.1.1', '0.1.2', '0.1.4', '0.1.3', '0.1.0', '0.1.0', '0.1.0', '0.1.0', '0.1.0']);
  assert.equal(pack.policies.cpoCtoConflict.protocolVersion, 2);
});

test('Markdown decision models are consumed as runtime rules for all three modes', () => {
  const modes = ['manual', 'assisted', 'autonomous'];
  const types = new Set(pack.decisionRules.map(rule => rule.type));
  for (const type of types) for (const mode of modes) {
    const matches = pack.decisionRules.filter(rule => rule.type === type && rule.mode === mode);
    assert.equal(matches.length, 1, `${type}/${mode}`);
    assert.ok(matches[0].source.endsWith('/decision_model.md'));
    assert.ok(matches[0].requiredEvidence.length > 0);
  }
  assert.ok(pack.decisionRules.every(rule => rule.mode !== 'manual' || rule.requiresHuman));
  assert.ok(pack.decisionRules.filter(rule => rule.type === 'product-decision-replacement').every(rule => rule.requiresHuman));
});

test('implementation rejection restarts the plan with a bounded audit-preserving rework policy', () => {
  const graph = pack.graphs.find(item => item.id === 'implementation');
  const gate = graph.nodes.find(node => node.id === 'implementation-gate');
  assert.equal(gate.reworkTarget, 'classify-implementation');
  assert.equal(gate.maxReworks, 3);
  assert.ok(gate.outcomes.includes('rework'));
  assert.ok(!graph.edges.some(edge => edge.from === gate.id && edge.when === 'rework'));
  assert.equal(pack.policies.selfReview.limitIsApproval, false);
});

test('important artifact tasks self review and hand off to an independent reviewer', () => {
  for (const graph of pack.graphs) for (const node of graph.nodes.filter(item => item.type === 'task' && item.produces?.length)) {
    if (['cpo-alignment', 'cto-alignment'].includes(node.id)) {
      assert.equal(node.review, undefined, `${node.id} is a signed position rather than an artifact approval`);
      continue;
    }
    assert.equal(node.review?.maxSelfReviews, 5, `${graph.id}/${node.id} lacks five-round self review`);
    assert.ok(node.review.supervisorRole !== node.role, `${graph.id}/${node.id} lacks independent reviewer role`);
  }
  for (const id of ['freeze-candidate', 'qa', 'security', 'regression']) {
    assert.ok(pack.graphs.find(item => item.id === 'verification').nodes.find(item => item.id === id).review);
  }
});

test('five unresolved P1 self reviews require independent rework rather than acceptance', async () => {
  const engine = new GraphEngine();
  await engine.registerPack(pack);
  const owner = { kind: 'human', id: 'review-owner', roles: ['human-owner'] };
  const feature = 'five-round-review';
  const baseline = await engine.recordProductDecision({ feature, actor: owner, status: 'approved', outcome: 'Keep approved behavior',
    reason: 'Review scenario baseline', evidence: [{ kind: 'requirement', id: 'REQ-5' }] });
  const run = await engine.startRun({ packId: pack.id, packVersion: pack.version, graphId: 'ui-ux-design', mode: 'autonomous', actor: owner,
    input: { feature, versioned_requirement: { id: 'REQ-5', version: 'v1' }, product_decision_refs: [baseline.id] } });
  const router = { kind: 'agent', id: 'po-5', roles: ['product-owner'], executionId: 'po-route-5' };
  await engine.decideNode({ runId: run.id, nodeId: 'classify-design', actor: router, outcome: 'minor',
    reason: 'Small design update', evidence: [{ kind: 'versioned_requirement' }, { kind: 'design_impact_rationale' }] });
  const author = { kind: 'agent', id: 'designer-5', roles: ['ui-ux-designer-lead'], executionId: 'designer-run-5' };
  const trace = await engine.recordWorkDecision({ runId: run.id, nodeId: 'minor-design', actor: author,
    category: 'product', question: 'Which approved requirement applies?',
    options: [{ id: 'pinned', label: 'Follow the pinned requirement' }], outcome: 'pinned',
    reason: 'This node is bound to the approved requirement.', ruleRef: 'node:minor-design', behaviorImpact: 'none',
    evidence: [{ kind: 'requirement', summary: 'Pinned requirement', sourceRef: { kind: 'run_input', key: 'versioned_requirement' } }] });
  const artifact = { kind: 'design_candidate', id: 'design-5', version: 'v1' };
  await engine.submitNode({ runId: run.id, nodeId: 'minor-design', actor: author, artifacts: [artifact], decisionIds: [trace.id] });
  for (let round = 1; round <= 5; round++) await engine.recordSelfReview({ runId: run.id, nodeId: 'minor-design', actor: author,
    artifactVersion: 'v1', findings: [{ severity: 'P1', status: 'open', summary: `Unresolved finding round ${round}` }] });
  const reviewer = { kind: 'agent', id: 'cpo-5', roles: ['cpo'], executionId: 'cpo-review-5' };
  const evidence = ['artifact_version', 'review_findings', 'self_review_history'].map(kind =>
    ({ kind, subjectRefs: [{ artifactId: artifact.id, version: artifact.version }] }));
  await assert.rejects(engine.reviewWork({ runId: run.id, nodeId: 'minor-design', actor: reviewer,
    outcome: 'accept', reason: 'Attempted automatic pass', evidence }), /unresolved P0\/P1/);
  const result = await engine.reviewWork({ runId: run.id, nodeId: 'minor-design', actor: reviewer,
    outcome: 'rework', reason: 'Independent reviewer requires a new candidate', evidence });
  assert.equal(result.decision.outcome, 'rework');
  assert.equal((await engine.getRun(run.id)).nodeStates['minor-design'].attempts[0].selfReviews.length, 5);
});

test('no-change design decision routes to preserving the existing design identity', async () => {
  const engine = new GraphEngine();
  await engine.registerPack(pack);
  const actor = { kind: 'human', id: 'owner-1', roles: ['human-owner', 'product-owner'] };
  const feature = 'no-change-design';
  const baseline = await engine.recordProductDecision({ feature, actor, status: 'approved', outcome: 'Preserve existing design', reason: 'Existing visual identity remains approved', evidence: [{ kind: 'requirement', id: 'REQ-1' }] });
  const run = await engine.startRun({ packId: pack.id, packVersion: pack.version, graphId: 'ui-ux-design', mode: 'manual', actor,
    input: { feature, versioned_requirement: { id: 'REQ-1', version: 'v1' }, product_decision_refs: [baseline.id] } });
  await engine.decideNode({ runId: run.id, nodeId: 'classify-design', actor, outcome: 'none', reason: 'Approved design already covers this change', evidence: [{ kind: 'versioned_requirement' }, { kind: 'design_impact_rationale' }] });
  assert.deepEqual((await engine.getReadyNodes(run.id)).map(node => node.id), ['preserve-design']);
  assert.equal((await engine.listDecisions({ runId: run.id })).at(-1).outcome, 'none');
});

async function playGraph(graphId, routes, expectedStatus) {
  const engine = new GraphEngine();
  await engine.registerPack(pack);
  const starter = { kind: 'human', id: 'owner', roles: ['human-owner'] };
  const feature = `scenario-${graphId}`;
  const baseline = await engine.recordProductDecision({ feature, actor: starter, status: 'approved', outcome: 'Use scenario baseline', reason: 'Scenario has an approved starting product decision', evidence: [{ kind: 'requirement', id: 'REQ-1' }] });
  const input = { feature, versioned_requirement: { id: 'REQ-1', version: 'v1' }, product_decision_refs: [baseline.id],
    ...(graphId === 'implementation' ? { final_design_identity: { id: 'DESIGN-1', version: 'v1' }, architecture_context: { disposition: 'not-applicable', rationale: 'Scenario uses existing architecture without interface changes' } } : {}),
    ...(graphId === 'verification' ? { implementation_candidate: { id: 'CODE-1', version: 'v1' }, acceptance_criteria: [{ id: 'AC-1', description: 'Expected behavior works', requirementIds: ['REQ-1'] }] } : {}),
    ...(graphId === 'system-architecture' ? { system_id: 'orders', architecture_brief: 'Pin the order API boundaries' } : {}),
    ...(graphId === 'code-delivery' ? { implementation_candidate: { id: 'CODE-1', version: 'v1' }, delivery_target: { repository: 'owner/repo', prUrl: 'https://github.com/owner/repo/pull/1', headSha: 'a'.repeat(40) }, required_checks: ['test'], required_approvals: 1 } : {}),
    ...(['product-discovery', 'request-triage'].includes(graphId) ? { source_request: { id: 'IDEA-1', version: 'v1' } } : {}),
    ...(graphId === 'release-process' ? { implementation_candidate: { id: 'CODE-1', version: 'v1' }, verification_decision: { id: 'ACCEPT-1', version: 'v1' } } : {}),
    ...(graphId === 'release-observation' ? { implementation_candidate: { id: 'CODE-1', version: 'v1' }, release_execution_event: { id: 'EXEC-1', version: 'v1' }, release_plan_identity: { id: 'PLAN-1', version: 'v1' }, release_authorization_decision: { id: 'START-1', version: 'v1' } } : {}),
    ...(graphId === 'production-monitoring' ? { service_identity: { id: 'SERVICE-1', version: 'v1' }, monitoring_plan_identity: { id: 'MON-PLAN-1', version: 'v1' }, observation_window: { start: '2026-10-28T00:00:00Z', end: '2026-10-28T01:00:00Z' }, signal_snapshot: { id: 'SIGNAL-1', version: 'v1' } } : {}) };
  const run = await engine.startRun({ packId: pack.id, packVersion: pack.version, graphId, mode: 'autonomous', actor: starter, input });
  const next = Object.fromEntries(Object.entries(routes).map(([key, value]) => [key, Array.isArray(value) ? [...value] : [value]]));
  let count = 0;
  while (count++ < 160) {
    const current = await engine.getRun(run.id);
    if (current.status !== 'running') {
      assert.equal(current.status, expectedStatus);
      return current;
    }
    const ready = await engine.getReadyNodes(run.id);
    assert.ok(ready.length, `${graphId} stalled at ${count}`);
    const node = ready[0];
    const rule = node.type === 'decision' ? pack.decisionRules.find(item => item.type === node.decisionType && item.mode === 'autonomous') : null;
    const actor = !node.role ? { kind: 'system', id: 'runner', roles: [] }
      : rule?.requiresHuman ? { kind: 'human', id: `owner-${node.role}`, roles: ['human-owner', node.role] }
      : { kind: 'agent', id: node.role, roles: [node.role], executionId: `${node.role}-${node.id}-${count}` };
    if (node.type === 'decision') {
      const outcome = next[node.id]?.shift() ?? (node.id === 'implementation-shape' ? 'parallel' : undefined);
      assert.ok(outcome, `missing route for ${node.id}`);
      const currentRefs = (node.candidateNodes ?? []).flatMap(id => current.nodeStates[id].artifacts.map(artifact => ({ artifactId: artifact.id, version: artifact.version })));
      const evidence = rule.requiredEvidence.map(kind => ({ kind, subjectRefs: currentRefs }));
      const selected = node.selection && outcome === 'accept'
        ? current.nodeStates[node.selection.sourceNodeId].output[node.selection.outputKey][0] : null;
      const artifacts = selected ? [{ kind: 'final_design_identity', id: selected.artifactId, version: selected.version }] : [];
      await engine.decideNode({ runId: run.id, nodeId: node.id, actor, outcome, reason: `Scenario route ${outcome}`, evidence, artifacts });
    } else {
      const artifacts = node.type === 'task' ? (node.produces ?? []).map(kind => ({ kind, id: `${node.id}-${kind}-artifact-${count}`, version: 'v1' })) : [];
      const workDecision = node.decisionTraceRequired ? await engine.recordWorkDecision({
        runId: run.id, nodeId: node.id, actor, category: node.role === 'ui-ux-designer-lead' ? 'product' : 'process',
        question: `Which pinned procedure applies to ${node.id}?`,
        options: [{ id: 'pinned-node', label: 'Follow the pinned Graph node' }], outcome: 'pinned-node',
        reason: `Node ${node.id} defines the required artifact and review route.`, ruleRef: `node:${node.id}`,
        behaviorImpact: 'none',
        evidence: [{ kind: 'requirement', summary: 'Versioned requirement for this run', sourceRef: { kind: 'run_input', key: 'versioned_requirement' } }]
      }) : null;
      const selectedFinalists = node.id === 'filter-finalists'
        ? ['freeze-a1', 'freeze-b1'].filter(id => current.nodeStates[id].status === 'completed')
          .map(id => ({ artifactId: current.nodeStates[id].artifacts[0].id,
          version: current.nodeStates[id].artifacts[0].version })) : null;
      const contractOutput = node.outputContract === 'acceptance-matrix'
        ? { candidateRefs: [{ artifactId: 'CODE-1', version: 'v1' }], criteria: [{ id: 'AC-1', result: 'pass', evidence: [{ kind: 'report', ref: 'artifact://qa', observed: 'Scenario passed' }] }] }
        : node.outputContract === 'triage-report'
        ? { requestRefs: [{ artifactId: 'IDEA-1', version: 'v1' }], category: 'enhancement', surface: 'issue',
          disposition: routes['triage-disposition'], duplicateCheck: { result: 'none', sourceRef: 'artifact://search/duplicates' },
          priorDecisionCheck: { result: 'none', sourceRef: 'artifact://product/decisions' },
          claimCheck: { result: 'not-applicable', sourceRef: 'artifact://request/idea-1' },
          ...(routes['triage-disposition'] === 'ready' ? { brief: { problem: 'User need', acceptanceBoundary: 'Observable result', evidenceRef: 'artifact://brief/1', owner: 'product-owner', nextGraph: 'product-discovery' } } : {}),
          ...(routes['triage-disposition'] === 'needs-info' ? { questions: ['Which user is affected?'] } : {}),
          ...(routes['triage-disposition'] === 'closed' ? { reason: 'Already addressed' } : {}) }
        : node.outputContract === 'work-plan'
        ? { tickets: [{ id: 'T-1', deliverable: 'Scenario outcome', owner: 'lead-engineer', verification: 'Run scenario check', blockers: [] }] }
        : node.outputContract === 'work-completion'
        ? { candidateRefs: [{ artifactId: artifacts.find(item => item.kind === 'implementation_candidate').id, version: 'v1' }],
          tickets: [{ id: 'T-1', result: 'complete', evidenceRef: 'artifact://checks/scenario', observed: 'Scenario passed' }] }
        : node.outputContract === 'architecture-baseline'
        ? { systemId: 'orders', summary: 'Order API boundary', diagram: 'API -> database', implementationStatus: 'proposed', invariants: [{ id: 'INV-001', rule: 'Only API writes', enforcement: 'Credentials', proof: 'ACL test', status: 'active' }] }
        : node.outputContract === 'delivery-report'
        ? { candidateRefs: [{ artifactId: 'CODE-1', version: 'v1' }], ...input.delivery_target, state: routes['delivery-gate'] === 'merged' ? 'merged' : 'open',
          checks: [{ name: 'test', headSha: input.delivery_target.headSha, sourceRef: 'https://ci/check/1', result: 'pass' }],
          approvals: [{ actorId: 'reviewer', headSha: input.delivery_target.headSha, sourceRef: 'https://pr/review/1' }],
          review: { headSha: input.delivery_target.headSha, sourceRef: 'artifact://review/1', verdict: 'approve' }, unresolvedFindings: 0, mergeable: true,
          ...(routes['delivery-gate'] === 'merged' ? { mergeEvent: { headSha: input.delivery_target.headSha, mergeSha: 'b'.repeat(40), sourceRef: 'https://pr/merge/1' } } : {}) }
        : {};
      await engine.submitNode({ runId: run.id, nodeId: node.id, actor,
        output: { result: node.id, ...(selectedFinalists ? { selectedFinalists } : {}), ...contractOutput }, artifacts,
        decisionIds: workDecision ? [workDecision.id] : [] });
      if (node.review) {
        await engine.recordSelfReview({ runId: run.id, nodeId: node.id, actor, artifactVersion: 'v1', findings: [] });
        const supervisor = { kind: 'agent', id: node.review.supervisorRole, roles: [node.review.supervisorRole], executionId: `supervisor-${node.id}-${count}` };
        const rule = pack.decisionRules.find(item => item.type === node.review.decisionType && item.mode === 'autonomous');
        await engine.reviewWork({ runId: run.id, nodeId: node.id, actor: supervisor, outcome: 'accept', reason: 'Independent check passed', evidence: rule.requiredEvidence.map(kind => ({ kind, subjectRefs: artifacts.map(artifact => ({ artifactId: artifact.id, version: artifact.version })) })) });
      }
    }
  }
  assert.fail(`${graphId} exceeded scenario step bound`);
}

test('major design executes wireframe filters, both four-candidate lanes and isolated prototypes', async () => {
  const run = await playGraph('ui-ux-design', {
    'classify-design': 'major', 'promote-directions': 'both', 'finalist-route': 'prototype', 'final-design': 'accept'
  }, 'completed');
  const completed = id => run.nodeStates[id].status === 'completed';
  assert.ok(completed('principle-research') && completed('blind-evaluator') && completed('product-owner-fit'));
  for (const id of ['a1','a2','a3','a4','b1','b2','b3','b4']) assert.ok(completed(`qc-${id}`));
  assert.ok(completed('prototype-a') && completed('prototype-b') && completed('experiment-comparison'));
  const identities = new Set(['a1','a2','a3','a4','b1','b2','b3','b4'].map(id => {
    const visual = run.nodeStates[`visual-${id}`].artifacts[0];
    const frozen = run.nodeStates[`freeze-${id}`].artifacts[0];
    const qc = run.nodeStates[`qc-${id}`].artifacts[0];
    assert.equal(visual.kind, `visual_candidate_${id}`);
    assert.equal(frozen.kind, `frozen_visual_${id}`);
    assert.equal(qc.kind, `visual_qc_${id}`);
    assert.ok(visual.id !== frozen.id && frozen.id !== qc.id);
    return `${visual.id}@${visual.version}`;
  }));
  assert.equal(identities.size, 8);
  assert.notEqual(run.nodeStates['prototype-a'].artifacts[0].id, run.nodeStates['prototype-b'].artifacts[0].id);
  const shortlist = run.nodeStates['filter-finalists'].output.selectedFinalists;
  const selected = run.nodeStates['final-design'].attempts.at(-1).artifacts;
  assert.deepEqual(pack.graphs.find(item => item.id === 'ui-ux-design').nodes.find(item => item.id === 'final-design').selection,
    { sourceNodeId: 'filter-finalists', outputKey: 'selectedFinalists',
      frozenNodeIds: ['freeze-a1', 'freeze-a2', 'freeze-a3', 'freeze-a4', 'freeze-b1', 'freeze-b2', 'freeze-b3', 'freeze-b4'] });
  assert.equal(shortlist.length, 2);
  assert.equal(selected.length, 1);
  assert.ok(shortlist.some(item => item.artifactId === selected[0].id && item.version === selected[0].version));
});

test('minor design and verification rejection retain distinct terminal state', async () => {
  const minor = await playGraph('ui-ux-design', { 'classify-design': 'minor', 'minor-gate': 'accept' }, 'completed');
  assert.equal(minor.nodeStates['minor-evaluation'].status, 'completed');
  const verification = await playGraph('verification', { 'acceptance-gate': 'rework' }, 'rework_required');
  assert.equal(verification.nodeStates['acceptance-gate'].outcome, 'rework');
});

test('implementation rejection restarts classification and planning before successful acceptance', async () => {
  const run = await playGraph('implementation', {
    'classify-implementation': ['feature', 'feature'], 'readiness-gate': ['proceed', 'proceed'],
    'implementation-gate': ['rework', 'accept']
  }, 'completed');
  assert.equal(run.nodeStates['classify-implementation'].attempts.length, 2);
  assert.equal(run.nodeStates['implementation-plan'].attempts.length, 2);
  assert.equal(run.nodeStates['implementation-gate'].attempts.length, 2);
});

test('readiness rework reruns classification before any implementation plan is accepted', async () => {
  const run = await playGraph('implementation', {
    'classify-implementation': ['feature', 'feature'], 'readiness-gate': ['rework', 'proceed'],
    'implementation-gate': 'accept'
  }, 'completed');
  assert.equal(run.nodeStates['implementation-readiness'].attempts.length, 2);
  assert.equal(run.nodeStates['implementation-plan'].attempts.length, 1);
  assert.equal(run.nodeStates['backend'].attempts.length, 1);
});

test('method skills and provenance are included in the runtime pack', () => {
  for (const id of ['requirements-discovery', 'systematic-debugging', 'development-loop', 'lifecycle-orchestration', 'product-discovery', 'release-process', 'production-monitoring']) {
    assert.match(pack.skills[id].digest, /^[a-f0-9]{64}$/);
  }
  assert.ok(pack.roles['product-manager'].skills.includes('requirements-discovery'));
  assert.ok(pack.roles['lead-engineer'].skills.includes('systematic-debugging'));
  assert.ok(pack.roles['lead-engineer'].skills.includes('development-loop'));
  assert.ok(pack.roles['product-owner'].skills.includes('lifecycle-orchestration'));
  assert.deepEqual(Object.keys(pack.methodReferences).sort(), ['adaptivePlanning', 'blueprint', 'debugging', 'development', 'discovery', 'factory', 'lifecycle', 'monitoring', 'release', 'requirements']);
  assert.equal(pack.policies.lifecycle.readiness, 'pass-concerns-fail-with-explicit-gaps');
});

test('every discoverable skill has a bounded task description and input/output contract', () => {
  for (const skill of Object.values(pack.skills)) {
    assert.ok(skill.description.length > 25 && skill.description.length < 180, skill.id);
    for (const field of ['triggers', 'nonTriggers', 'inputs', 'outputs']) {
      assert.ok(Array.isArray(skill[field]) && skill[field].length, `${skill.id}.${field}`);
    }
  }
  assert.match(pack.skills['release-process'].nonTriggers.join(' '), /certification/);
});

test('defect route requires root-cause report and red check before readiness and planning', async () => {
  const run = await playGraph('implementation', {
    'classify-implementation': 'defect', 'readiness-gate': 'proceed', 'implementation-gate': 'accept'
  }, 'completed');
  for (const id of ['defect-diagnosis', 'defect-red-check', 'implementation-readiness', 'implementation-plan']) {
    assert.equal(run.nodeStates[id].status, 'completed');
  }
  assert.ok(run.nodeStates['defect-diagnosis'].attempts[0].at <= run.nodeStates['defect-red-check'].attempts[0].at);
  assert.ok(run.nodeStates['defect-red-check'].attempts[0].at <= run.nodeStates['implementation-plan'].attempts[0].at);
});

test('direct design selection and bounded minor rework run through active branches', async () => {
  const major = await playGraph('ui-ux-design', {
    'classify-design': 'major', 'promote-directions': 'a', 'finalist-route': 'direct', 'final-design': 'accept'
  }, 'completed');
  assert.equal(major.nodeStates['qc-a4'].status, 'completed');
  assert.equal(major.nodeStates['visual-b1'].status, 'pending');
  assert.equal(major.nodeStates['no-prototype-record'].status, 'completed');
  const minor = await playGraph('ui-ux-design', { 'classify-design': 'minor', 'minor-gate': ['rework', 'accept'] }, 'completed');
  assert.equal(minor.nodeStates['minor-design'].attempts.length, 2);
});

test('verification acceptance and human escalation preserve distinct outcomes', async () => {
  const accepted = await playGraph('verification', { 'acceptance-gate': 'accept' }, 'completed');
  assert.equal(accepted.nodeStates['verification-complete'].status, 'completed');
  const waiting = await playGraph('ui-ux-design', { 'classify-design': 'minor', 'minor-gate': 'human' }, 'paused');
  assert.ok(waiting.pendingHuman);
});

test('discovery can advance, stop, or request more evidence before any build path', async () => {
  const engine = new GraphEngine();
  await engine.registerPack(pack);
  const opened = await engine.startRun({ packId: pack.id, packVersion: pack.version, graphId: 'product-discovery', mode: 'assisted',
    actor: { kind: 'human', id: 'research-owner', roles: ['human-owner', 'product-owner'] },
    input: { source_request: { id: 'IDEA-RAW', version: 'v1' } } });
  assert.deepEqual((await engine.getReadyNodes(opened.id)).map(node => node.id), ['frame-discovery']);
  const advanced = await playGraph('product-discovery', { 'discovery-gate': 'advance' }, 'completed');
  assert.equal(advanced.nodeStates['discovery-advance'].status, 'completed');
  assert.equal(advanced.nodeStates['synthesize-discovery'].artifacts.length, 4);
  const stopped = await playGraph('product-discovery', { 'discovery-gate': 'stop' }, 'completed');
  assert.equal(stopped.nodeStates['discovery-stop'].status, 'completed');
  const repeated = await playGraph('product-discovery', { 'discovery-gate': ['more-research', 'advance'] }, 'completed');
  assert.equal(repeated.nodeStates['frame-discovery'].attempts.length, 2);
  assert.equal(repeated.nodeStates['discovery-gate'].attempts.length, 2);
  assert.equal(pack.decisionRules.find(rule => rule.type === 'discovery-disposition' && rule.mode === 'autonomous').requiresHuman, true);
});

test('request triage preserves ready, needs-info and closed outcomes', async () => {
  for (const [outcome, end] of [['ready', 'triage-ready'], ['needs-info', 'triage-needs-info'], ['closed', 'triage-closed']]) {
    const run = await playGraph('request-triage', { 'triage-disposition': outcome }, 'completed');
    assert.equal(run.nodeStates[end].status, 'completed');
    assert.equal(run.nodeStates['assess-request'].output.disposition, outcome);
  }
});

test('ticket frontier follows declared blockers', () => {
  const plan = { tickets: [
    { id: 'T-1', deliverable: 'First behavior', owner: 'lead-engineer', verification: 'Run first journey', blockers: [] },
    { id: 'T-2', deliverable: 'Second behavior', owner: 'lead-engineer', verification: 'Run second journey', blockers: ['T-1'] }
  ] };
  assert.deepEqual(readyWorkTickets(plan), ['T-1']);
  assert.deepEqual(readyWorkTickets(plan, ['T-1']), ['T-2']);
  assert.deepEqual(readyWorkTickets(plan, ['T-1', 'T-2']), []);
  assert.throws(() => readyWorkTickets({ tickets: [{ ...plan.tickets[0], blockers: ['T-2'] }, plan.tickets[1]] }), /cycle/);
});

test('release preparation stops at host execution and cannot assume a pipeline', async () => {
  const held = await playGraph('release-process', { 'release-start': 'hold' }, 'completed');
  assert.equal(held.nodeStates['release-held'].status, 'completed');
  const ready = await playGraph('release-process', { 'release-start': 'start' }, 'completed');
  assert.equal(ready.nodeStates['release-await-execution'].status, 'completed');
  assert.equal(ready.nodeStates['release-start'].attempts.at(-1).actor.kind, 'human');
  assert.ok(!ready.graph.nodes.some(node => node.id === 'record-release-execution'));
  assert.equal(pack.policies.releaseProcess.pipeline, 'unselected');
  assert.equal(pack.policies.releaseProcess.certification, false);
  for (const type of ['release-process-start', 'release-process-outcome']) {
    assert.equal(pack.decisionRules.find(rule => rule.type === type && rule.mode === 'autonomous').requiresHuman, true);
  }
});

test('release observation requires a host execution event and records all three dispositions', async () => {
  const engine = new GraphEngine();
  await engine.registerPack(pack);
  const actor = { kind: 'human', id: 'owner', roles: ['human-owner'] };
  await assert.rejects(engine.startRun({ packId: pack.id, packVersion: pack.version, graphId: 'release-observation', mode: 'autonomous', actor,
    input: { implementation_candidate: { id: 'CODE-1', version: 'v1' }, release_plan_identity: { id: 'PLAN-1', version: 'v1' }, release_authorization_decision: { id: 'START-1', version: 'v1' } } }), /release_execution_event/);
  await assert.rejects(engine.startRun({ packId: pack.id, packVersion: pack.version, graphId: 'release-observation', mode: 'autonomous', actor,
    input: { implementation_candidate: { id: 'CODE-1', version: 'v1' }, release_plan_identity: { id: 'PLAN-1', version: 'v1' }, release_execution_event: { id: 'EXEC-1', version: 'v1' } } }), /release_authorization_decision/);
  for (const [outcome, endNode] of [['complete', 'release-complete'], ['recover', 'release-recovery'], ['investigate', 'release-investigation']]) {
    const run = await playGraph('release-observation', { 'release-outcome': outcome }, 'completed');
    assert.equal(run.nodeStates[endNode].status, 'completed');
  }
});

test('monitoring evaluates one sourced window and routes health, watch, incident, and data gaps', async () => {
  const engine = new GraphEngine();
  await engine.registerPack(pack);
  await assert.rejects(engine.startRun({ packId: pack.id, packVersion: pack.version, graphId: 'production-monitoring', mode: 'autonomous',
    actor: { kind: 'human', id: 'owner', roles: ['human-owner'] },
    input: { service_identity: { id: 'SVC-1', version: 'v1' }, observation_window: { start: '2026-10-28T00:00:00Z' }, signal_snapshot: { id: 'SIGNAL-1', version: 'v1' } } }), /monitoring_plan_identity/);
  for (const [outcome, endNode] of [['healthy', 'monitoring-healthy'], ['watch', 'monitoring-watch'], ['investigate', 'monitoring-investigation'], ['insufficient-data', 'monitoring-unknown']]) {
    const run = await playGraph('production-monitoring', { 'monitoring-disposition': outcome }, 'completed');
    assert.equal(run.nodeStates[endNode].status, 'completed');
  }
  assert.equal(pack.policies.productionMonitoring.ingestionAndScheduling, 'host-responsibility');
});

test('all four implementation shapes join only their active branches and review an integrated candidate', async () => {
  for (const shape of ['backend', 'frontend', 'fullstack', 'parallel']) {
    const run = await playGraph('implementation', { 'classify-implementation': 'feature', 'readiness-gate': 'proceed',
      'implementation-shape': shape, 'implementation-gate': 'accept' }, 'completed');
    for (const branch of ['backend', 'frontend', 'fullstack']) {
      assert.equal(run.nodeStates[branch].status, branch === shape || shape === 'parallel' && branch !== 'fullstack' ? 'completed' : 'pending');
    }
    assert.equal(run.nodeStates['integrate-candidate'].status, 'completed');
    assert.equal(run.nodeStates['independent-implementation-review'].status, 'completed');
    assert.equal(run.nodeStates['integrate-candidate'].artifacts[0].kind, 'implementation_candidate');
  }
});

test('optional architecture and code-delivery graphs execute their documented outcomes', async () => {
  const architecture = await playGraph('system-architecture', { 'architecture-gate': ['rework', 'accept'] }, 'completed');
  assert.equal(architecture.nodeStates['architecture-baseline'].attempts.length, 2);
  assert.equal(architecture.nodeStates['architecture-baseline'].output.implementationStatus, 'proposed');
  for (const outcome of ['ready', 'merged', 'hold']) {
    const run = await playGraph('code-delivery', { 'delivery-gate': outcome }, 'completed');
    assert.equal(run.nodeStates['delivery-gate'].outcome, outcome);
  }
});
