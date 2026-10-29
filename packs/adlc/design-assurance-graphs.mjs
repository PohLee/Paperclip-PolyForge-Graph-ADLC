const task = (id, role, supervisorRole, purpose, extra) => ({
  id, type: 'task', role, purpose, decisionTraceRequired: true,
  review: { supervisorRole, maxSelfReviews: 5, decisionType: 'review-disposition' }, ...extra
});
const edge = (from, to, when) => ({ from, to, ...(when ? { when } : {}) });

export const designAssuranceGraphs = [
  {
    id: 'technical-design', version: '0.1.0', start: 'draft-technical-design',
    description: 'For a complex or high-impact feature, bridge accepted requirements to code seams and tests; review comprehension and risk before CTO acceptance.',
    nodes: [
      task('draft-technical-design', 'principal-engineer', 'cto-caio',
        'Write the versioned problem, scope, approach, alternatives, boundaries, failure modes, verification, rollback and targeted context index.',
        { requiredInputs: ['versioned_requirement', 'feature', 'product_decision_refs'], produces: ['technical_design'], outputContract: 'technical-design' }),
      task('comprehension-review', 'lead-engineer', 'principal-engineer',
        'In a fresh host session, read the indexed sources and paraphrase the design without author conversation; record misunderstood or missing decisions.',
        { independentOf: ['draft-technical-design'], freshContextRequired: true,
          produces: ['design_comprehension'], outputContract: 'design-comprehension' }),
      task('design-audit', 'qa-engineer', 'cto-caio',
        'Review reuse/zoom-out, comprehension, failure modes and implementation feasibility against the exact design version; give sourced findings.',
        { independentOf: ['draft-technical-design', 'comprehension-review'], produces: ['design_audit'], outputContract: 'design-audit' }),
      { id: 'technical-design-gate', type: 'decision', role: 'cto-caio', decisionType: 'technical-design-acceptance',
        outcomes: ['accept', 'rework', 'human'], requiredInputs: ['technical_design', 'design_comprehension', 'design_audit'],
        candidateNodes: ['draft-technical-design', 'comprehension-review', 'design-audit'],
        candidateKinds: ['technical_design', 'design_comprehension', 'design_audit'],
        decisionContract: { type: 'technical-design-approval', sourceNode: 'design-audit' },
        reworkTarget: 'draft-technical-design', maxReworks: 3 },
      { id: 'design-accepted', type: 'end', output: 'accepted_technical_design' },
      { id: 'design-human', type: 'end', output: 'human_decision_pending' }
    ],
    edges: [edge('draft-technical-design', 'comprehension-review'), edge('comprehension-review', 'design-audit'),
      edge('design-audit', 'technical-design-gate'), edge('technical-design-gate', 'design-accepted', 'accept'),
      edge('technical-design-gate', 'design-human', 'human')]
  },
  {
    id: 'design-drift', version: '0.1.0', start: 'compare-design-code', inputContracts: ['design-drift-target'],
    description: 'Reconcile an accepted technical design against one pinned code revision; record matches, stale documentation, code divergence and uncertainty.',
    nodes: [
      task('compare-design-code', 'principal-engineer', 'cto-caio',
        'Inspect the accepted design and pinned code SHA; cite code locations and evidence for every material claim. Update design or code through a separate change before rerunning.',
        { requiredInputs: ['feature', 'versioned_requirement', 'technical_design_context', 'code_sha'], produces: ['design_drift_report'], outputContract: 'design-drift-report' }),
      { id: 'drift-gate', type: 'decision', role: 'cto-caio', decisionType: 'design-drift-disposition',
        outcomes: ['ready', 'hold', 'human'], requiredInputs: ['design_drift_report'],
        candidateNodes: ['compare-design-code'], candidateKinds: ['design_drift_report'],
        decisionContract: { type: 'design-drift-disposition', sourceNode: 'compare-design-code' } },
      { id: 'drift-reconciled', type: 'end', output: 'design_code_reconciled' },
      { id: 'drift-held', type: 'end', output: 'design_code_drift_held' },
      { id: 'drift-human', type: 'end', output: 'human_decision_pending' }
    ],
    edges: [edge('compare-design-code', 'drift-gate'), edge('drift-gate', 'drift-reconciled', 'ready'),
      edge('drift-gate', 'drift-held', 'hold'), edge('drift-gate', 'drift-human', 'human')]
  }
];
