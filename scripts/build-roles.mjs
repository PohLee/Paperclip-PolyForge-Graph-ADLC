import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { roleCatalog, decisionTypes } from '../roles/catalog.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const modes = ['manual', 'assisted', 'autonomous'];
const alwaysHuman = new Set(['product-scope-change', 'product-decision-replacement']);
const assistedHuman = new Set(['design-selection', 'verification-acceptance', 'implementation-acceptance']);

for (const role of roleCatalog) {
  const dir = resolve(root, 'roles', role.id);
  mkdirSync(dir, { recursive: true });
  const header = `# ${role.name}\n\n`;
  writeFileSync(resolve(dir, 'soul.md'), header + role.soul + '\n');
  const manager = role.reportsToRole === null ? 'Board' : `\`${role.reportsToRole}\``;
  writeFileSync(resolve(dir, 'role.md'), header + role.role + `\n\n## Organization\n\nReports to ${manager}. This is the Paperclip manager relationship.\n\n## Artifact review\n\nDefault review escalation role: \`${role.supervisor}\`. Follow the assigned Graph node's reviewer for each artifact. Independent review uses an execution identity distinct from the author. An actual agent may hold multiple roles.\n`);
  writeFileSync(resolve(dir, 'goal.md'), header + role.goal + '\n');
  writeFileSync(resolve(dir, 'instruction.md'), header + `## Work\n\n${role.method}\n\n## Coordination\n\nUse the organizational reporting line in [role.md](role.md) for management. Send artifact reviews to the reviewer specified by the active Graph node.\n\n## Handoff\n\nName exact input and output artifact versions. Cite active product decisions and history for affected features. Record every explicit decision with the actor identity, role, mode, rule version, evidence, rationale and outcome before relying on it. Keep superseded decisions and stale reports linked in history. Follow [decision_model.md](decision_model.md) for authority.\n`);
  const rules = role.rules.map(type => {
    const { evidence } = decisionTypes[type];
    return {
      type,
      requiredEvidence: evidence,
      modes: Object.fromEntries(modes.map(mode => {
        const requiresHuman = mode === 'manual' || alwaysHuman.has(type) || (mode === 'assisted' && assistedHuman.has(type));
        return [mode, {
          allowedRoles: requiresHuman ? ['human-owner'] : type === 'review-disposition' ? ['cpo', 'cto-caio', 'principal-engineer'] : [role.id],
          allowedKinds: requiresHuman ? ['human'] : ['agent', 'human'],
          requiresHuman,
          continueWhen: 'A durable Decision Record has been written and all required evidence points to the artifact version examined.',
          escalateWhen: 'Required evidence is missing, P0/P1 risk is unresolved without permitted acceptance, or actor authority is insufficient.'
        }];
      }))
    };
  });
  const model = { schemaVersion: 1, role: role.id, rules };
  writeFileSync(resolve(dir, 'decision_model.md'), header + 'Decision authority for this role. The JSON block is loaded by the pack at runtime. A role with no rules provides evidence and recommendations only.\n\n```json\n' + JSON.stringify(model, null, 2) + '\n```\n');
}
