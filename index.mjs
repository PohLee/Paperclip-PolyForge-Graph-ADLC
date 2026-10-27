import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { engineeringGraphs } from './engineering-graphs.mjs';
import { designGraph } from './design-graph.mjs';
import { roleCatalog } from './roles/catalog.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const docs = ['soul', 'role', 'goal', 'instruction', 'decision_model'];
const digest = value => createHash('sha256').update(value).digest('hex');
const roleSkills = {
  'cpo': ['product-memory', 'design-evaluation', 'conflict-resolution', 'versioned-evidence'],
  'internal-product-analyst': ['product-memory', 'versioned-evidence'],
  'external-product-analyst': ['design-evaluation', 'versioned-evidence'],
  'product-manager': ['product-memory', 'design-evaluation', 'versioned-evidence'],
  'product-owner': ['product-memory', 'versioned-evidence'],
  'ui-ux-designer-lead': ['product-memory', 'design-evaluation', 'review-handoff'],
  'cto-caio': ['product-memory', 'conflict-resolution', 'review-handoff', 'versioned-evidence'],
  'principal-engineer': ['product-memory', 'review-handoff', 'versioned-evidence'],
  'lead-engineer': ['product-memory', 'review-handoff', 'versioned-evidence'],
  'qa-engineer': ['product-memory', 'versioned-evidence'],
  'security-engineer': ['review-handoff', 'versioned-evidence']
};
const skillIds = ['product-memory', 'review-handoff', 'design-evaluation', 'conflict-resolution', 'versioned-evidence'];
const skills = Object.fromEntries(skillIds.map(id => {
  const source = `skills/${id}.md`, content = readFileSync(resolve(root, source), 'utf8');
  return [id, { id, source, content, digest: digest(content) }];
}));

function loadRole(spec) {
  const documents = Object.fromEntries(docs.map(name => [name, readFileSync(resolve(root, 'roles', spec.id, `${name}.md`), 'utf8')]));
  const match = documents.decision_model.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) throw new Error(`Missing JSON decision model: ${spec.id}`);
  const model = JSON.parse(match[1]);
  if (model.role !== spec.id || model.schemaVersion !== 1) throw new Error(`Invalid decision model: ${spec.id}`);
  return {
    id: spec.id, name: spec.name, reportsToRole: spec.reportsToRole, supervisorRole: spec.supervisor,
    documents, documentDigests: Object.fromEntries(Object.entries(documents).map(([name, value]) => [name, digest(value)])),
    skills: roleSkills[spec.id],
    capabilityRequirements: spec.capabilities,
    decisionModel: model
  };
}

const roles = Object.fromEntries(roleCatalog.map(spec => [spec.id, loadRole(spec)]));
const graphs = [designGraph, ...engineeringGraphs];
const operatingPolicies = readFileSync(resolve(root, 'OPERATING_POLICIES.md'), 'utf8');
const decisionRules = Object.values(roles).flatMap(role => role.decisionModel.rules.flatMap(rule =>
  Object.entries(rule.modes).map(([mode, policy]) => ({
    type: rule.type, mode, allowedRoles: policy.allowedRoles, allowedKinds: policy.allowedKinds,
    requiredEvidence: rule.requiredEvidence, requiresHuman: policy.requiresHuman,
    continueWhen: policy.continueWhen, escalateWhen: policy.escalateWhen,
    source: `roles/${role.id}/decision_model.md`, sourceDigest: role.documentDigests.decision_model
  }))
));

export const pack = {
  id: 'adlc', version: '0.1.1', schemaVersion: 1,
  graphs, roles, skills, decisionRules,
  graphStartRoles: {
    'ui-ux-design': ['product-owner', 'cpo', 'human-owner'],
    implementation: ['product-owner', 'principal-engineer', 'cto-caio', 'human-owner'],
    verification: ['product-owner', 'cpo', 'cto-caio', 'human-owner']
  },
  policyDocuments: { operatingPolicies },
  policyDocumentDigests: { operatingPolicies: digest(operatingPolicies) },
  runtimeRequirements: {
    binding: 'Bind every role to a runtime actor at deployment. A single agent may hold several roles.',
    independentReview: 'The review execution/session identity must differ from every author execution named by independentOf; one Agent may hold both roles in separate executions.',
    humanOwner: 'Bind human-owner to an authenticated human operation identity; an agent suggestion is never a human approval.',
    capabilities: 'Resolve each role capabilityRequirement to a real tool, permission or harness before dispatch. Bundled skills are prompt instructions, not claims about installed tools.'
  },
  policies: {
    selfReview: { maxRoundsPerSubmission: 5, exitWhen: 'No P0/P1 remains or round 5 completes', supervisorRequired: true, limitIsApproval: false, preserveAttempts: true },
    productMemory: { beforeChange: ['active_product_decisions', 'change_history', 'known_constraints'], behaviorChangeRequires: 'product-decision-replacement', supersession: 'append-and-link', missingContext: 'escalate-unknown' },
    evidence: { handoff: 'versioned-artifact-identity', reportsBindTo: 'exact-candidate-version', changedCandidate: 'invalidate-affected-reports-and-reverify', preserveStaleReports: true },
    audit: { decisions: 'all-human-and-agent', states: ['accept', 'reject', 'rework', 'defer', 'escalate', 'supersede'], writeBeforeProceed: true, appendOnly: true },
    cpoCtoConflict: {
      source: 'PolyLens collision and synthesis methods adapted to CPO/CTO',
      dimensions: ['scope', 'timeline', 'resource', 'risk', 'success_criteria'],
      classes: ['priority', 'scope', 'risk', 'resource', 'fundamental'],
      steps: ['preserve-original-positions-and-evidence', 'deduplicate-and-classify-conflicts', 'propose-resolution-by-class', 'request-revised-position-from-both', 'record-convergence-or-pause-for-human'],
      unresolved: 'human-owner', appliesInEveryMode: true
    }
  }
};

export default pack;
