import test from 'node:test';
import assert from 'node:assert/strict';
import { GraphEngine } from '../../Paperclip-PolyForge-Graph/src/core/index.mjs';
import { pack } from '../index.mjs';
import { roleCatalog } from '../roles/catalog.mjs';

test('published pack registers with the core validator and has exact MVP inventory', async () => {
  const engine = new GraphEngine();
  await engine.registerPack(pack);
  assert.deepEqual(pack.graphs.map(graph => graph.id), ['ui-ux-design', 'implementation', 'verification']);
  assert.equal(Object.keys(pack.roles).length, 11);
  assert.equal(new Set(pack.graphs.map(graph => `${graph.id}@${graph.version}`)).size, 3);
});

test('every task role and supervisor maps to a documented blueprint', () => {
  const ids = new Set(roleCatalog.map(role => role.id));
  for (const graph of pack.graphs) for (const node of graph.nodes) {
    if (node.role) assert.ok(ids.has(node.role), `${graph.id}/${node.id} uses unknown role ${node.role}`);
    if (node.review) {
      assert.ok(ids.has(node.review.supervisorRole), `${graph.id}/${node.id} has unknown supervisor`);
      assert.equal(node.review.maxSelfReviews, 5);
    }
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
  assert.equal(pack.version, '0.1.1');
  assert.deepEqual(Object.fromEntries(Object.values(pack.roles).map(role => [role.id, role.reportsToRole])), reportsTo);
  assert.deepEqual(Object.fromEntries(Object.values(pack.roles).map(role => [role.id, role.supervisorRole])), reviewEscalation);
  assert.equal(Object.values(pack.roles).filter(role => role.reportsToRole === null).length, 2);
  assert.equal(Object.values(pack.roles).filter(role => role.reportsToRole !== null).length, 9);
  for (const role of Object.values(pack.roles)) {
    assert.match(role.documents.role, /## Organization\n\nReports to /);
    assert.match(role.documents.role, /## Artifact review\n\nDefault review escalation role:/);
    assert.match(role.documents.instruction, /organizational reporting line.*Graph node/s);
  }
  assert.deepEqual(pack.graphs.map(graph => graph.version), ['0.1.0', '0.1.0', '0.1.0']);
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
  assert.equal(gate.reworkTarget, 'implementation-plan');
  assert.equal(gate.maxReworks, 3);
  assert.ok(gate.outcomes.includes('rework'));
  assert.ok(!graph.edges.some(edge => edge.from === gate.id && edge.when === 'rework'));
  assert.equal(pack.policies.selfReview.limitIsApproval, false);
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
    ...(graphId === 'implementation' ? { final_design_identity: { id: 'DESIGN-1', version: 'v1' } } : {}),
    ...(graphId === 'verification' ? { implementation_candidate: { id: 'CODE-1', version: 'v1' } } : {}) };
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
    const actor = node.role
      ? { kind: 'agent', id: node.role, roles: [node.role], executionId: `${node.role}-${node.id}-${count}` }
      : { kind: 'system', id: 'runner', roles: [] };
    if (node.type === 'decision') {
      const outcome = next[node.id]?.shift();
      assert.ok(outcome, `missing route for ${node.id}`);
      const rule = pack.decisionRules.find(item => item.type === node.decisionType && item.mode === 'autonomous');
      const currentRefs = (node.candidateNodes ?? []).flatMap(id => current.nodeStates[id].artifacts.map(artifact => ({ artifactId: artifact.id, version: artifact.version })));
      const evidence = rule.requiredEvidence.map(kind => ({ kind, subjectRefs: currentRefs }));
      await engine.decideNode({ runId: run.id, nodeId: node.id, actor, outcome, reason: `Scenario route ${outcome}`, evidence });
    } else {
      const artifacts = node.type === 'task' ? (node.produces ?? []).map(kind => ({ kind, id: `${node.id}-${kind}-artifact-${count}`, version: 'v1' })) : [];
      await engine.submitNode({ runId: run.id, nodeId: node.id, actor, output: { result: node.id }, artifacts });
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
});

test('minor design and verification rejection retain distinct terminal state', async () => {
  const minor = await playGraph('ui-ux-design', { 'classify-design': 'minor', 'minor-gate': 'accept' }, 'completed');
  assert.equal(minor.nodeStates['minor-evaluation'].status, 'completed');
  const verification = await playGraph('verification', { 'acceptance-gate': 'rework' }, 'rework_required');
  assert.equal(verification.nodeStates['acceptance-gate'].outcome, 'rework');
});

test('implementation rejection restarts planning before successful acceptance', async () => {
  const run = await playGraph('implementation', { 'implementation-gate': ['rework', 'accept'] }, 'completed');
  assert.equal(run.nodeStates['implementation-plan'].attempts.length, 2);
  assert.equal(run.nodeStates['implementation-gate'].attempts.length, 2);
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
