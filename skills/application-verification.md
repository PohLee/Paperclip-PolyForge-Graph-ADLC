# Application verification

Use when QA or engineering needs repeatable proof of user-facing behavior on a real application surface. The host provides the tools, permissions, isolated environment and artifact store.

1. Inspect how this project actually starts and what users touch. Create a project-local verification recipe with **Launch**, **Doctor**, **Drive**, **Evidence**, and **Cleanup**. Start from an empty test state, check readiness beyond process liveness, drive stable user controls, observe side effects, and retain proof after cleanup. Name the surface and environment limits.
2. Index the most important user journeys in a feature map. Each entry names how a user reaches it, the drive steps, and an observable end state. Choose coverage from the approved requirement rather than a fixed number of journeys.
3. Execute the recipe once on a mapped journey before publishing it. Record the recipe artifact identity and proof run in `project_verification` using `pack.policyDocuments.evidenceContracts`. A recipe that cannot be executed is a draft; mark affected criteria unverified.
4. On a fixed candidate, use the recipe for applicable QA and regression checks. Bind commands, screenshots, transcripts or state observations to the candidate and acceptance matrix. Distinguish harness drift, environment failure and product regression. Complete when the evidence survives cleanup and the matrix reflects what was actually observed.
