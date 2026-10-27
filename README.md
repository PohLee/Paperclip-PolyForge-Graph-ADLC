# Paperclip PolyForge Graph — ADLC Pack

Versioned Agentic Development Life Cycle domain pack for the separate [PolyForge Graph core](../Paperclip-PolyForge-Graph). Import `pack` from `index.mjs`, register it with `GraphEngine.registerPack(pack)`, and bind its role IDs to real Paperclip agents or authenticated human operations in the host. The pack contains no agent UUIDs or installed-tool claims.

Current pack version: `adlc@0.1.1`. The three workflow graph definitions remain at `0.1.0`; this pack update adds organization reporting metadata and clearer role instructions.

## Included workflows

| Graph | Result | Main route |
| --- | --- | --- |
| `ui-ux-design@0.1.0` | `final_design_identity` | none/minor/major; major runs principle research, two wireframes, norms/PO/blind filters, one or two promoted directions, four frozen and independently checked visuals per direction, at most two finalists, optional isolated A/B prototypes, and CPO selection |
| `implementation@0.1.0` | `implementation_acceptance` | plan, backend and frontend parallel work, ALL join, independent review, CTO + CAIO gate; a recorded rejection restarts the plan, up to three times before human intervention |
| `verification@0.1.0` | `acceptance_decision` | pin one candidate, parallel QA/security/regression, ALL join, CPO acceptance |

Design and implementation use bounded `reworkTarget` resets that keep prior attempts and decisions. Verification `rework_required` is a distinct terminal status that hands work back for a changed candidate and new verification run. Old reports remain attached to the version they actually assessed. Human escalation pauses a run.

## Runtime contract

```js
import { pack } from './index.mjs';
await engine.registerPack(pack);
await engine.startRun({ packId: pack.id, packVersion: pack.version,
  graphId: 'implementation', mode: 'assisted', input, actor });
```

The host must supply trusted actor identity, role bindings, execution identity, available capabilities, and versioned artifacts. The `roles` map contains each role's five Markdown documents and SHA-256 digests. `decisionRules` are parsed from the fenced JSON in the role `decision_model.md` files at import time. Five bundled Markdown skills are carried in `pack.skills`; each role lists the skill IDs it uses. The host provides their content to the runtime and resolves capability requirements to real tools. A supervisor review uses an execution identity distinct from the author. In manual mode, the authenticated human needs `human-owner` plus the gate's domain role, such as `cpo`, in the trusted actor context.

`roles[*].reportsToRole` defines the Paperclip organization, separate from `supervisorRole` for artifact review escalation. `null` means direct reporting to Board: CPO and CTO + CAIO are Board peers. Internal Product Analyst, External Product Analyst, Product Manager, Product Owner, and UI/UX Designer Lead report to CPO. Principal Engineer, Lead Engineer, QA Engineer, and Security Engineer report to CTO + CAIO. A Graph node's `review.supervisorRole` selects its actual artifact reviewer and can differ from the organizational manager.

Every required evidence item is identified by `kind`. Gate evidence must also reference the exact current candidate artifacts with `subjectRefs`. The host records a decision before following its route. It should link product decisions, history and artifact versions to each change. See [operating policies](OPERATING_POLICIES.md) and the core contract for method details.

## Maintenance

Edit `roles/catalog.mjs`, then run `node scripts/build-roles.mjs` to refresh the agent Markdown. Review the generated `decision_model.md` blocks: they are the runtime source of decision authority. Increment the pack and affected graph versions before publishing changed behavior. Existing runs retain the previous snapshot.

Validate with `node --test`. The tests use the sibling core source and require both repositories side by side.

Licensing for this separate pack has not yet been selected.
