# Accepted design and code drift

Use after implementing a feature with an accepted technical design, before treating that design as current documentation. Start `design-drift` with the exact accepted design artifact and gate decision plus a full code SHA. Compare the design's material claims with code at that revision and publish one versioned `design_drift_report`.

For each material claim record a stable row ID, design claim, code path or symbol, observed behavior, source evidence and one status: `matched`, `doc-stale`, `code-diverged`, or `unverified`. Include failure handling and verification claims, not just happy-path wiring. A sourced mismatch cannot become a match by changing its label.

The CTO/CAIO can mark `ready` only when all rows match the pinned revision. Otherwise hold or escalate and name whether the next action is a design revision, code correction or missing evidence. Make that change in its normal authorized path; then run drift comparison again against the new accepted design version or code SHA. This report does not alter code, approve a product change, or substitute for release checks.

The host authenticates the repository checkout, SHA and cited source observations. Core checks version bindings, row structure and the ready gate; it cannot independently inspect the repository.
