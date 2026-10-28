# Engineering delivery

Use for implementation planning, frontend or backend execution, architecture review, or engineering acceptance.

Read architecture_context and its accepted baseline or reviewed non-applicability rationale. Cite affected invariant IDs and proof in the plan. After planning, record the smallest suitable implementation-shape: backend, frontend, fullstack or parallel. Integrate active branches into one versioned implementation_candidate before independent review. Use the host check runner when configured and preserve its logs.

1. Pin the approved requirement, design identity, product decisions, and candidate boundaries. Classify feature versus defect. For a defect, finish systematic debugging and preserve a red executable check before the implementation plan. Challenge readiness and record unresolved decisions before the gate proceeds.
2. Define interfaces and tests in an accepted plan. Give each frontend or backend task an owner and separate artifact identity. Delegate only through a host authorized runtime; retain the child execution ID, input, output, and review evidence.
3. Run the development loop on each slice. Build and test changed behavior, check protected behavior, and review code and test evidence. Record unresolved findings and a concrete rework target.
4. Complete when all active branches and independent review cite the integrated candidate version, the gate decision is recorded, and retrospective observations are linked for future planning. A rejected fix returns to classification and root-cause evidence.
