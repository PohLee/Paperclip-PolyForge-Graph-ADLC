const task = (id, role, purpose, extra = {}) => ({ id, type: 'task', role, purpose, ...extra, ...(extra.review ? { review: { ...extra.review, decisionType: 'review-disposition' } } : {}) });
const decision = (id, role, outcomes, extra = {}) => ({ id, type: 'decision', role, decisionType: 'design-selection', outcomes, ...extra });
const join = id => ({ id, type: 'join', mode: 'all' });
const end = (id, output) => ({ id, type: 'end', output });
const edge = (from, to, when) => when === undefined ? { from, to } : { from, to, when };

const visualIds = ['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4'];
const visualNodes = visualIds.flatMap(id => [
  task(`visual-${id}`, 'ui-ux-designer-lead', `Produce distinct visual candidate ${id} from the promoted wireframe, including states and accessibility.`, { produces: [`visual_candidate_${id}`], review: { supervisorRole: 'cpo', maxSelfReviews: 5 } }),
  task(`freeze-${id}`, 'product-owner', `Save and freeze candidate ${id} with immutable version and digest.`, { produces: [`frozen_visual_${id}`] }),
  task(`qc-${id}`, 'product-manager', `Independently check frozen candidate ${id} for requirement fit, norms and defects.`, { independentOf: [`visual-${id}`], produces: [`visual_qc_${id}`] })
]);
const visualEdges = visualIds.flatMap(id => [
  edge('promote-directions', `visual-${id}`, id[0] === 'a' ? ['a', 'both'] : ['b', 'both']),
  edge(`visual-${id}`, `freeze-${id}`), edge(`freeze-${id}`, `qc-${id}`), edge(`qc-${id}`, 'visuals-qc-ready')
]);

export const designGraph = {
  id: 'ui-ux-design', version: '0.1.0', start: 'classify-design',
  description: 'Research precedes wireframes; independent checks promote one or two directions; four visuals per direction are frozen and checked before finalist selection.',
  visualCandidatePolicy: { minPerDirection: 2, defaultPerDirection: 4, maxPerDirection: 5, instantiatedPerDirection: 4, maxFinalists: 2 },
  nodes: [
    { id: 'classify-design', type: 'decision', role: 'product-owner', decisionType: 'graph-routing', outcomes: ['none', 'minor', 'major'], requiredInputs: ['versioned_requirement', 'product_decision_refs'] },
    task('preserve-design', 'product-owner', 'Bind the existing approved design identity and document why no redesign is required.', { produces: ['final_design_identity'] }),
    task('minor-design', 'ui-ux-designer-lead', 'Produce a focused versioned design change with accessibility and edge states.', { produces: ['design_candidate'], review: { supervisorRole: 'cpo', maxSelfReviews: 5 } }),
    task('minor-evaluation', 'product-manager', 'Independently assess requirement and product-decision fit.', { independentOf: ['minor-design'], produces: ['design_evaluation'] }),
    decision('minor-gate', 'cpo', ['accept', 'rework', 'human'], { requiredInputs: ['design_candidate', 'design_evaluation'], reworkTarget: 'minor-design', maxReworks: 3 }),
    task('principle-research', 'external-product-analyst', 'Research users, patterns, constraints and design principles before wireframing; cite sources and uncertainty.', { produces: ['principle_research'] }),
    task('wireframe-a', 'ui-ux-designer-lead', 'Produce wireframe direction A from the research and approved requirement.', { produces: ['wireframe_a'], review: { supervisorRole: 'cpo', maxSelfReviews: 5 } }),
    task('wireframe-b', 'ui-ux-designer-lead', 'Produce a distinct wireframe direction B from the same research.', { produces: ['wireframe_b'], review: { supervisorRole: 'cpo', maxSelfReviews: 5 } }),
    join('wireframes-ready'),
    task('design-norms-check', 'product-manager', 'Check anonymized wireframes against design norms and accessibility.', { independentOf: ['wireframe-a', 'wireframe-b'], produces: ['norms_report'] }),
    task('product-owner-fit', 'product-owner', 'Check directions against approved requirements and product memory.', { independentOf: ['wireframe-a', 'wireframe-b'], produces: ['product_fit_report'] }),
    task('blind-evaluator', 'product-manager', 'Evaluate anonymized directions without author labels; retain scores and rejection reasons.', { independentOf: ['wireframe-a', 'wireframe-b'], isolation: 'blind-anonymized-input', produces: ['blind_evaluation'] }),
    join('wireframe-checks-ready'),
    decision('promote-directions', 'cpo', ['a', 'b', 'both', 'rework', 'human'], { requiredInputs: ['norms_report', 'product_fit_report', 'blind_evaluation'], maxPromotedDirections: 2, reworkTarget: 'principle-research', maxReworks: 3 }),
    ...visualNodes,
    join('visuals-qc-ready'),
    task('filter-finalists', 'product-manager', 'Compare frozen QC-passing visuals against the same criteria; promote at most two and retain all rejection reasons.', { independentOf: visualIds.map(id => `visual-${id}`), maxFinalists: 2, produces: ['finalist_shortlist'] }),
    decision('finalist-route', 'cpo', ['direct', 'prototype', 'rework', 'human'], { requiredInputs: ['finalist_shortlist'], prototypeRequires: 2, reworkTarget: 'principle-research', maxReworks: 3 }),
    task('no-prototype-record', 'product-owner', 'Record why an A/B prototype is unnecessary, plus requirement-fit evidence.', { produces: ['experiment_record'] }),
    task('prototype-a', 'ui-ux-designer-lead', 'Prototype finalist A in a separately isolated execution context.', { isolation: 'prototype-a', produces: ['prototype_a'] }),
    task('prototype-b', 'ui-ux-designer-lead', 'Prototype finalist B in a separately isolated execution context.', { isolation: 'prototype-b', produces: ['prototype_b'] }),
    join('prototypes-ready'),
    task('experiment-comparison', 'product-manager', 'Compare A/B outcomes against predeclared criteria and exact prototype versions.', { independentOf: ['prototype-a', 'prototype-b'], produces: ['experiment_record'] }),
    decision('final-design', 'cpo', ['accept', 'rework', 'human'], { decisionTitle: 'Head of Design', requiredInputs: ['finalist_shortlist', 'product_fit_report', 'experiment_record'], reworkTarget: 'principle-research', maxReworks: 3 }),
    end('design-complete', 'final_design_identity'), end('design-human', 'human_decision_pending')
  ],
  edges: [
    edge('classify-design', 'preserve-design', 'none'), edge('preserve-design', 'design-complete'),
    edge('classify-design', 'minor-design', 'minor'), edge('minor-design', 'minor-evaluation'), edge('minor-evaluation', 'minor-gate'),
    edge('minor-gate', 'design-complete', 'accept'), edge('minor-gate', 'design-human', 'human'),
    edge('classify-design', 'principle-research', 'major'), edge('principle-research', 'wireframe-a'), edge('principle-research', 'wireframe-b'),
    edge('wireframe-a', 'wireframes-ready'), edge('wireframe-b', 'wireframes-ready'),
    edge('wireframes-ready', 'design-norms-check'), edge('wireframes-ready', 'product-owner-fit'), edge('wireframes-ready', 'blind-evaluator'),
    edge('design-norms-check', 'wireframe-checks-ready'), edge('product-owner-fit', 'wireframe-checks-ready'), edge('blind-evaluator', 'wireframe-checks-ready'),
    edge('wireframe-checks-ready', 'promote-directions'), ...visualEdges,
    edge('visuals-qc-ready', 'filter-finalists'), edge('filter-finalists', 'finalist-route'),
    edge('finalist-route', 'no-prototype-record', 'direct'), edge('finalist-route', 'prototype-a', 'prototype'), edge('finalist-route', 'prototype-b', 'prototype'), edge('finalist-route', 'design-human', 'human'),
    edge('prototype-a', 'prototypes-ready'), edge('prototype-b', 'prototypes-ready'), edge('prototypes-ready', 'experiment-comparison'),
    edge('no-prototype-record', 'final-design'), edge('experiment-comparison', 'final-design'),
    edge('promote-directions', 'design-human', 'human'), edge('final-design', 'design-complete', 'accept'), edge('final-design', 'design-human', 'human')
  ]
};
