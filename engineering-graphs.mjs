const task = (id, role, purpose, extra = {}) => ({ id, type: 'task', role, purpose, ...extra, ...(extra.review ? { review: { ...extra.review, decisionType: 'review-disposition' } } : {}) });
const decision = (id, role, decisionType, outcomes, extra = {}) => ({ id, type: 'decision', role, decisionType, outcomes, ...extra });
const join = id => ({ id, type: 'join', mode: 'all' });
const end = (id, output) => ({ id, type: 'end', output });
const edge = (from, to, when) => when === undefined ? { from, to } : { from, to, when };

export const engineeringGraphs = [
  {
    id: 'implementation', version: '0.1.0', start: 'implementation-plan',
    description: 'Plan, implement and test both lanes, independently review the fixed candidate, then accept or restart planning with retained history.',
    nodes: [
      task('implementation-plan', 'principal-engineer', 'Read active product decisions and design identity; define contract, tests and change boundaries.', { requiredInputs: ['versioned_requirement', 'final_design_identity', 'product_decision_refs'], produces: ['implementation_plan'], review: { supervisorRole: 'cto-caio', maxSelfReviews: 5 } }),
      task('backend', 'lead-engineer', 'Implement backend scope and run relevant tests; publish a versioned candidate.', { produces: ['backend_candidate', 'backend_test_report'], review: { supervisorRole: 'principal-engineer', maxSelfReviews: 5 } }),
      task('frontend', 'lead-engineer', 'Implement frontend scope and run relevant tests; publish a versioned candidate.', { produces: ['frontend_candidate', 'frontend_test_report'], review: { supervisorRole: 'principal-engineer', maxSelfReviews: 5 } }),
      join('implementation-ready'),
      task('independent-implementation-review', 'principal-engineer', 'Inspect code, tests and requirements from a distinct execution identity; report defects by severity.', { independentOf: ['backend', 'frontend'], produces: ['implementation_review'] }),
      decision('implementation-gate', 'cto-caio', 'implementation-acceptance', ['accept', 'rework', 'human'], { requiredInputs: ['implementation_review', 'backend_candidate', 'frontend_candidate'], candidateNodes: ['backend', 'frontend'], candidateKinds: ['backend_candidate', 'frontend_candidate'], reworkTarget: 'implementation-plan', maxReworks: 3 }),
      end('implementation-complete', 'implementation_acceptance'), end('implementation-human', 'human_decision_pending')
    ],
    edges: [
      edge('implementation-plan', 'backend'), edge('implementation-plan', 'frontend'),
      edge('backend', 'implementation-ready'), edge('frontend', 'implementation-ready'),
      edge('implementation-ready', 'independent-implementation-review'), edge('independent-implementation-review', 'implementation-gate'),
      edge('implementation-gate', 'implementation-complete', 'accept'), edge('implementation-gate', 'implementation-human', 'human')
    ]
  },
  {
    id: 'verification', version: '0.1.0', start: 'freeze-candidate',
    description: 'Verify one fixed candidate in parallel; rework requires a changed implementation candidate and a new verification run.',
    nodes: [
      task('freeze-candidate', 'product-owner', 'Pin the implementation candidate, requirement and decision versions for this verification run.', { requiredInputs: ['implementation_candidate', 'versioned_requirement', 'product_decision_refs'], produces: ['fixed_candidate_identity'] }),
      task('qa', 'qa-engineer', 'Test behavior and exploratory edge cases against the fixed candidate.', { produces: ['qa_report'] }),
      task('security', 'security-engineer', 'Inspect threat model and security controls against the fixed candidate.', { produces: ['security_report'] }),
      task('regression', 'qa-engineer', 'Run regression coverage for protected product behavior against the fixed candidate.', { produces: ['regression_report'] }),
      join('verification-ready'),
      decision('acceptance-gate', 'cpo', 'verification-acceptance', ['accept', 'rework', 'human'], { requiredInputs: ['fixed_candidate_identity', 'qa_report', 'security_report', 'regression_report'], candidateNodes: ['freeze-candidate'], candidateKinds: ['fixed_candidate_identity'] }),
      end('verification-complete', 'acceptance_decision'), end('verification-rework', 'rework_required'), end('verification-human', 'human_decision_pending')
    ],
    edges: [
      edge('freeze-candidate', 'qa'), edge('freeze-candidate', 'security'), edge('freeze-candidate', 'regression'),
      edge('qa', 'verification-ready'), edge('security', 'verification-ready'), edge('regression', 'verification-ready'),
      edge('verification-ready', 'acceptance-gate'), edge('acceptance-gate', 'verification-complete', 'accept'),
      edge('acceptance-gate', 'verification-rework', 'rework'), edge('acceptance-gate', 'verification-human', 'human')
    ]
  }
];
