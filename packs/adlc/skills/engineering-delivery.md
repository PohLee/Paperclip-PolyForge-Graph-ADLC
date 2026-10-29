# Engineering delivery

Use for implementation planning, frontend or backend execution, architecture review, or engineering acceptance.

Read architecture_context and its accepted baseline or reviewed non-applicability rationale. Cite affected invariant IDs and proof in the plan. After planning, record the smallest suitable implementation-shape: backend, frontend, fullstack or parallel. Integrate active branches into one versioned implementation_candidate before independent review. Use the host check runner when configured and preserve its logs.

For complex or high-impact features, require `technical_design_context` at readiness and cite the accepted design and gate decision. Map planned tickets to its boundaries, failure modes and verification checks. After implementation, compare the approved design with the pinned code revision through `design-drift`; a mismatch needs a design revision or code correction in its authorized path before the design is treated as current.

1. Pin the approved requirement, design identity, product decisions, and candidate boundaries. Classify feature versus defect. For a defect, finish systematic debugging and preserve a red executable check before the implementation plan. Challenge readiness and record unresolved decisions before the gate proceeds.
2. Define interfaces and tests in an accepted plan. Use ticket-planning to publish unique ticket IDs, independent deliverables, owners, verification and acyclic blocker edges in the `implementation-plan` output contract. Record a delegation decision for each proposed split: shared mutable state, independent deliverable, tool conflict, and integration check. Delegate only when the boundary is independent or isolation is required, through a host authorized runtime; retain the child execution ID, input, output, and review evidence.
3. Run the development loop on each slice. Build and test changed behavior, check protected behavior, and review code and test evidence. Record unresolved findings and a concrete rework target.
4. Complete when all active branches and independent review cite the integrated candidate version, the gate decision is recorded, and retrospective observations are linked for future planning. A rejected fix returns to classification and root-cause evidence.
