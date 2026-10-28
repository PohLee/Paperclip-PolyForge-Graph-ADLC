# Paperclip PolyForge Graph — ADLC Pack

Versioned Agentic Development Life Cycle domain pack for the separate [PolyForge Graph core](../Paperclip-PolyForge-Graph). Import `pack` from `index.mjs`, register it with `GraphEngine.registerPack(pack)`, and bind its role IDs to real Paperclip agents or authenticated human operations in the host. The pack contains no agent UUIDs or installed-tool claims.

Current pack version: `adlc@0.1.6`. Design is `0.1.2`, verification is `0.1.1`, and implementation is `0.1.2`; the four new lifecycle graphs are `0.1.0`. Every artifact-producing task requires an attempt-bound work Decision Record.

## Included workflows

| Graph | Result | Main route |
| --- | --- | --- |
| `product-discovery@0.1.0` | `accepted_intent` or `no_build_decision` | frame the problem, gather internal and user/external evidence, synthesize options, human CPO disposition: advance, more research, or stop |
| `ui-ux-design@0.1.2` | `final_design_identity` | none/minor/major; major runs principle research, two wireframes, norms/PO/blind filters, one or two promoted directions, four frozen and independently checked visuals per direction, at most two finalists, optional isolated A/B prototypes, and CPO selection of exactly one current frozen finalist |
| `implementation@0.1.2` | `implementation_acceptance` | classify feature/defect; defects require root-cause evidence and a failing check; readiness gate; plan, backend and frontend parallel work, ALL join, independent review, CTO + CAIO gate; rejection restarts classification, up to three times before human intervention |
| `verification@0.1.1` | `acceptance_decision` | pin one candidate, parallel QA/security/regression, ALL join, CPO acceptance |
| `release-process@0.1.0` | `ready_for_host_execution` or `release_held` | pin the verified candidate; plan, preflight and coordinate; a named human records operational start or hold |
| `release-observation@0.1.0` | `release_recorded`, `recovery_pending`, or `incident_handoff` | start only from a host-supplied execution event and linked plan/authorization; run smoke and health checks; human outcome decision |
| `production-monitoring@0.1.0` | `healthy_observation`, `watch_scheduled`, `incident_handoff`, or `health_unverified` | evaluate one sourced observation window against a versioned monitoring plan and route the evidence |

Design and implementation use bounded `reworkTarget` resets that keep prior attempts and decisions. Verification `rework_required` is a distinct terminal status that hands work back for a changed candidate and new verification run. Old reports remain attached to the version they actually assessed. Human escalation pauses a run.

## Runtime contract

```js
import { pack } from './index.mjs';
await engine.registerPack(pack);
await engine.startRun({ packId: pack.id, packVersion: pack.version,
  graphId: 'implementation', mode: 'assisted', input, actor });
```

The host must supply trusted actor identity, role bindings, execution identity, available capabilities, and versioned artifacts. The `roles` map contains each role's five Markdown documents and SHA-256 digests. `decisionRules` are parsed from the fenced JSON in the role `decision_model.md` files at import time. Eighteen bundled Markdown skills are carried in `pack.skills`; each role lists the skill IDs it uses. The host provides their content to the runtime and resolves capability requirements to real tools. A supervisor review uses an execution identity distinct from the author. For human gates, the authenticated human needs `human-owner` plus the gate's domain role, such as `cpo` or `cto-caio`, in the trusted actor context.

Discovery starts from a sourced request without an approved product decision. An `advance` decision accepts the versioned intent for requirements definition; before the existing design or implementation graphs start, the host must record the approved product decision and pass exact requirement and design identities. The release process graph stops at `ready_for_host_execution`. The host then performs the release with its actual procedure and starts release observation only after supplying the execution event, plan identity, authorization decision and candidate identity. The pack does not select a pipeline, execute production changes, or provide full release certification. Before production monitoring starts, the host supplies a versioned monitoring plan with service owner, signal definitions, sources, thresholds, freshness and action owner. The graph evaluates one supplied window; telemetry ingestion, scheduling, paging and recovery execution remain host capabilities.

## Method alignment

| Reference | Applied in this pack |
| --- | --- |
| [Anthropic AI-native SDLC playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook) | `lifecycle-orchestration` carries sourced intent → accepted spec → plan → candidate/tests → review → verification → decision, with versioned handoffs and feedback into the next change. |
| [BMad Method](https://www.bmadcode.com/method) | `requirements-discovery` and `product-definition` scale planning to uncertainty, give requirements stable IDs, and check readiness for missing decisions before implementation. |
| [Superpowers systematic debugging](https://github.com/obra/superpowers/tree/main/skills/systematic-debugging) | `systematic-debugging` and the defect route require investigation, comparison, one tested hypothesis, a red reproduction, and focused verification. |
| [Matt Pocock skills](https://github.com/mattpocock/skills) | Requirements discovery uses detailed clarification, shared language, explicit assumptions, traceable specs, and testable criteria. |
| [pstack](https://github.com/cursor/plugins/tree/main/pstack) | `development-loop` selects a small data and interface shape, uses tight feedback, keeps the diff focused, and closes with independent review and evidence. |
| [GOV.UK discovery guidance](https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works) | `product-discovery` investigates the user problem and permits a reasoned no-build decision. |
| [Google SRE release engineering](https://sre.google/sre-book/release-engineering/) and [DORA deployment guidance](https://dora.dev/capabilities/deployment-automation/) | `release-process` separates preparation from execution; `release-observation` requires an external execution event and records the observed result. |
| [Google SRE monitoring guidance](https://sre.google/sre-book/monitoring-distributed-systems/) | `production-monitoring` tracks user-facing symptoms, explicit windows and data gaps before routing incidents. |

These are adaptations of the named methods, not bundled copies or claims that their external plugins are installed. The [best-practice research note](docs/ADLC_BEST_PRACTICES.md) lists the first-party sources, artifacts, and pack/host boundary in detail.

`roles[*].reportsToRole` defines the Paperclip organization, separate from `supervisorRole` for artifact review escalation. `null` means direct reporting to Board: CPO and CTO + CAIO are Board peers. Internal Product Analyst, External Product Analyst, Product Manager, Product Owner, and UI/UX Designer Lead report to CPO. Principal Engineer, Lead Engineer, QA Engineer, and Security Engineer report to CTO + CAIO. A Graph node's `review.supervisorRole` selects its actual artifact reviewer and can differ from the organizational manager.

Every artifact-producing task records a sourced work choice in the current attempt and submits its ID in `decisionIds`. The core checks actor, execution, attempt, and active product decision references. CPO/CTO conflict protocol v2 requires independent positions and a documented negotiation before human resolution. Named external design, developer-subagent, and security methods are conditional on actual host installation and permission.

Every required evidence item is identified by `kind`. Gate evidence must also reference the exact current candidate artifacts with `subjectRefs`. The host records a decision before following its route. It should link product decisions, history and artifact versions to each change. See [operating policies](OPERATING_POLICIES.md) and the core contract for method details.

## Maintenance

Edit `roles/catalog.mjs`, then run `node scripts/build-roles.mjs` to refresh the agent Markdown. Review the generated `decision_model.md` blocks: they are the runtime source of decision authority. Increment the pack and affected graph versions before publishing changed behavior. Existing runs retain the previous snapshot.

Validate with `node --test`. The tests use the sibling core source and require both repositories side by side.

Licensing for this separate pack has not yet been selected.
