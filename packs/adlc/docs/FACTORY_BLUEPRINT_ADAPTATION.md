# Method adaptations and agent ownership

Implementation: ADLC 0.1.7 / Core 0.4.0, 2026-10-28. Reference snapshots verified before implementation: [Factory 5b0ff7e](https://github.com/owainlewis/factory/tree/5b0ff7e0bff9dc5a2ed405c335985a30f00b0108) and [Blueprint 74210b5](https://github.com/owainlewis/blueprint/tree/74210b5f4f07e6a213d2d3950603f55a868c9f4a). The designs below are local adaptations, with ADLC role authority and host boundaries preserved.

## Changes implemented

| Verified gap | Implementation | Owner | Enforcement / limitation |
| --- | --- | --- | --- |
| Acceptance coverage existed in prose but not runtime validation | Criterion IDs and requirement links, acceptance-matrix task, evidence and exception contract | PM/PO define scope; QA produces; CPO gates; human owns exceptions | Core rejects missing/duplicate rows, stale candidate, empty passing proof and failed criteria. Host verifies input scope and truth of proof. |
| Dispatch existed without a reusable bounded check executor | Core host runner with setup, command/agent checks, feedback, timeout, logs, manifest and strict pass/retry/stop | Lead Engineer runs; Principal Engineer/QA review | Executable library and CLI; host supplies agent adapter/permissions and artifact publication. No automatic runtime installation. |
| Every implementation activated backend and frontend | Shape decision, active branch join, integrated candidate | Principal Engineer chooses; Lead Engineer implements; independent PE execution reviews | All four paths exercised in pack tests. |
| Readiness lacked persistent system context | Optional system-architecture graph and accepted baseline context | PE authors; CTO accepts; PO/LE consume | Core checks recorded acceptance and invariant continuity. Host chooses applicable current baseline. Implementation status stays separate. |
| PR closure evidence absent | Optional code-delivery graph tied to pinned PR head | PE collects; CTO decides; LE/QA support | Core checks report consistency and conditions. Host verifies live repository data. No merge or deployment command. |

Factory informs executable checks, bounded correction, criterion proof and closure. Blueprint informs modular workflow shape and persistent architecture/invariant context. New Core validation rules are our implementation decisions; these repositories are not asserted to provide identical contracts.

## Existing references mapped to agents

| Reference | Main agents | Application |
| --- | --- | --- |
| [BMad Method](https://www.bmadcode.com/method) | Product Manager, Product Owner; internal/external analysts support; PE and CTO assess readiness | Adaptive planning depth, versioned intent/spec, requirement traceability and readiness gaps |
| [Matt Pocock skills](https://github.com/mattpocock/skills) | Product Manager, Product Owner, internal/external Product Analysts | Requirements clarification, shared language, explicit assumptions and testable criteria through requirements-discovery/product-definition |
| [pstack](https://github.com/cursor/plugins/tree/main/pstack) | Principal Engineer, Lead Engineer | development-loop: small executable slices, interface/data choices, focused tests and independent review |
| [Superpowers systematic debugging](https://github.com/obra/superpowers/tree/main/skills/systematic-debugging) | Lead Engineer, Principal Engineer | Root-cause investigation and failing reproduction before defect implementation |
| [Anthropic AI-native SDLC](https://claude.com/resources/articles/the-ai-native-sdlc-playbook) | Product Owner, CPO, CTO | Lifecycle orchestration and versioned feedback between stages |

Skills are local adaptations assigned through `index.mjs`. Reference names do not mean the upstream plugin is installed. Discovery, release and monitoring source mapping remains in [ADLC_BEST_PRACTICES.md](ADLC_BEST_PRACTICES.md).

## Rollout and verification boundary

Upgrade Core and pack together; old runs retain their pinned snapshots. New implementation inputs require architecture_context; verification requires acceptance_criteria. Optional graphs are explicitly started. The release pipeline remains unselected and release scope remains operational flow without full certification.

Local regression tests cover all four shapes, new graph outcomes, criterion proof and human escalation, baseline references and revisions, PR-head consistency, and real bounded Node command execution. Docker/Paperclip, external PR services, model-provider callbacks and production telemetry need separate environment validation after installation. Historical acceptance records remain evidence for their original versions.
