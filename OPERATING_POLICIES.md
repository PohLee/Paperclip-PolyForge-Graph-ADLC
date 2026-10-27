# ADLC operating policies

## Review and escalation

For an important artifact, the author checks a specific artifact version and records each self review round: findings with severity, fixes, remaining issues and supporting evidence. Stop self review when no P0/P1 remains or after round five. Submit the full history and any remaining P0/P1 to the Graph-designated review supervisor (`node.review.supervisorRole`). The fifth round is a handoff boundary, not acceptance. That reviewer independently inspects the artifact, records acceptance or bounded rework, and gives explicit treatment to known risks. A new submission retains earlier attempts in the audit trail. Each role's `roles/<role-id>/role.md` states its separate organizational reporting line.

The Design Lead's independent evaluator is the Product Manager; the CPO makes the selection. The Principal Engineer reviews Lead Engineer code with a distinct actor and execution identity. Any agent may fill multiple roles outside an independent review boundary. The host checks actual identity rather than a role label.

## CPO and CTO + CAIO conflict

Adapted from PolyLens [Collision Engine](https://github.com/PohLee/PolyLens/blob/92ed5fadd31177f67166e855a6e7e56a8a79c767/engines/collision.md) and [Synthesis Engine](https://github.com/PohLee/PolyLens/blob/92ed5fadd31177f67166e855a6e7e56a8a79c767/engines/synthesis.md):

1. Save both original positions, evidence, assumptions, non-negotiables and GO/MODIFY/BLOCK verdicts. Compare scope, timeline, resources, risk and success criteria even when verdict labels match.
2. Deduplicate underlying conflicts and classify each as priority, scope, risk, resource or fundamental.
3. Test a phased plan for priority disputes; seek the smallest scope covering compatible non-negotiables for scope disputes; compare impact, likelihood, reversibility and mitigation for risk; inspect commitment and evidence for resource disputes. Use a focused challenge and response when needed.
4. Obtain a revised position from each side. Record resolved and remaining issues. When a material conflict remains, save the options and tradeoffs, pause affected progress and ask the authenticated human owner. The human decision is recorded before work resumes, in every automation mode.

## Product memory and versioned evidence

Before a fix or feature edit, read relevant active product decisions, change history and known constraints. A missing retrieval result is an unknown, not proof that no constraint exists. If the intended edit changes approved behavior, create a proposed product decision replacement and obtain its required authority before implementation. Link replacement to the old decision; preserve both and their reasons.

Each handoff names the exact requirement, design and candidate versions. QA, security and regression reports name the candidate they checked. When that candidate changes, mark affected reports stale and reverify; keep historical reports for traceability. Every human and agent decision is an append-only record of actor, role, mode, rule, evidence, outcome, reason, risks and affected artifacts. A failed decision write leaves the gate waiting.

## Scope of this version

The pack publishes the three MVP graphs. Market research as a separate workflow, automatic scheduling and release automation are not defined here; their scope remains to be settled after scenario validation.
