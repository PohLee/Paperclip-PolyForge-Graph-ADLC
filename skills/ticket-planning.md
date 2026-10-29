# Ticket planning

Use after readiness when an implementation plan must be split into executable work. The implementation-plan output contract is the source of truth; see `pack.policyDocuments.evidenceContracts`.

1. Turn accepted behavior into the smallest tickets that each deliver an independently observable result. Name owner, deliverable, verification, and exact blocker IDs. For a wide migration that cannot stay green as a vertical slice, state the expansion, caller batches and contraction dependencies in that order.
2. Validate the ticket graph: unique IDs, known blockers, no cycles. Compute the ready frontier from completed IDs, and dispatch only ready tickets. The host or tracker preserves status and proof; Graph role authority and delegated execution rules still apply.
3. After integration, list every planned ticket once against the pinned candidate with its observed result and evidence reference. Missing or incomplete tickets block the integrated completion contract. Complete when the independent reviewer can trace each finished ticket to the plan and check the actual result.
