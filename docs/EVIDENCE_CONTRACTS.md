# Evidence contracts — ADLC 0.1.7

Requires Core 0.4.0+. The core validates submitted coverage and identity. The host authenticates actors, executes checks and verifies external sources. Schema validity cannot establish that a command ran or a remote PR is still current. Fetch this full pinned policy document when dispatch context is truncated.

## Verification

Supply `implementation_candidate`, requirement, product decisions and `acceptance_criteria`:

```json
[{"id":"AC-1","description":"An authorized user can save a draft","requirementIds":["REQ-1"]}]
```

After QA/security/regression, `acceptance-matrix` submits a versioned `acceptance_matrix` artifact and this `output`:

```json
{"candidateRefs":[{"artifactId":"CODE-1","version":"v1"}],"criteria":[{"id":"AC-1","result":"pass","evidence":[{"kind":"command","ref":"artifact://checks/run-1/manifest.json","observed":"Draft persistence test passed"}]}]}
```

Cover every input criterion exactly once. Result is pass/fail/unverified; proof kind is command/browser/manual/report. Pass/fail require proof. Fail/unverified require a `gap`. Candidate references exactly match the run input, including composite candidates. Fail blocks acceptance. Only an authenticated human-owner can accept unverified, with one additional evidence item per gap:

```json
{"kind":"acceptance_exception","criterionId":"AC-1","reason":"Staging unavailable; explicitly defer this check","risk":"Persistence remains unverified","subjectRefs":[{"artifactId":"MATRIX-1","version":"v1"}]}
```

All other required gate evidence must still reference both frozen identity and matrix artifacts. Normal and escalated gates enforce the same rule. An exception cannot waive fail. Contracted outputs/artifacts are immutable per attempt: record findings, reach supervisor review, request rework and resubmit output with a new artifact version. Prior attempts remain auditable.

## Architecture and implementation shape

Optional `system-architecture` starts with `system_id` and `architecture_brief`. Submit kind `architecture_baseline` with:

```json
{"systemId":"orders","summary":"Order API owns persistence","diagram":"client -> order API -> orders store","implementationStatus":"proposed","invariants":[{"id":"INV-001","rule":"Only order API writes the orders store","enforcement":"Scoped credentials","proof":"Access-control integration check","status":"active"}]}
```

CTO acceptance is separate from proposed/partial/implemented status. Every invariant has a stable INV-ID, rule, enforcement, proof and active/retired status. For revision supply `previous_architecture` using the context below; preserve old IDs and provide `changeReason` on rule changes or retirement.

New implementation runs require `architecture_context`:

```json
{"disposition":"baseline","systemId":"orders","baseline":{"artifactId":"ARCH-1","version":"v1"},"decisionId":"recorded-architecture-gate-decision-id"}
```

The core checks the actual accepted attempt, system and artifact version. The host selects the currently applicable baseline; no global latest-baseline registry or automatic supersession is provided. Alternatively use `{"disposition":"not-applicable","rationale":"Documentation-only correction without runtime or interface impact"}` and obtain CTO readiness review. Plans and independent reviews cite affected invariant IDs and proof.

After planning, Principal Engineer selects backend/frontend/fullstack/parallel. Fullstack executes one coupled slice; parallel activates both branches. ALL waits only for active branches. Integration produces one `implementation_candidate` and test report before independent review; verification pins that identity.

## Optional code delivery

`code-delivery` observes PR integration without performing merges or production actions. Alongside `implementation_candidate`, start with:

```json
{"delivery_target":{"repository":"owner/repo","prUrl":"https://github.com/owner/repo/pull/123","headSha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"},"required_checks":["test"],"required_approvals":1}
```

Submit kind `delivery_report` and:

```json
{"candidateRefs":[{"artifactId":"CODE-1","version":"v1"}],"prUrl":"https://github.com/owner/repo/pull/123","headSha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","state":"open","checks":[{"name":"test","sourceRef":"https://github.com/owner/repo/actions/runs/123","headSha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","result":"pass"}],"approvals":[{"actorId":"reviewer-1","sourceRef":"https://github.com/owner/repo/pull/123#pullrequestreview-1","headSha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}],"review":{"sourceRef":"artifact://review/1","headSha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","verdict":"approve"},"unresolvedFindings":0,"mergeable":true}
```

Ready requires every configured check passing, independent approving review, distinct approvals meeting the policy count, zero unresolved findings and mergeability. Missing/pending/failing checks permit hold. The host verifies review independence, reviewer eligibility, required-check policy and source authenticity. A new head requires a new run. Merged requires `state: "merged"` plus `mergeEvent: {sourceRef, headSha, mergeSha}`; this records an observed merge, without claiming the merge commit was tested. Release preparation, human authorization and host execution remain separate; pipeline remains unselected.

## Check execution

Core supplies optional `src/host/check-runner.mjs` and CLI `scripts/check-runner.mjs` (built as `dist/check-runner.js`). Host-owned configuration defines command/agent checks, setup, feedback, timeouts and attempt bounds; see Core's host runner guide. Publish logs/manifests as immutable source artifacts and map actual observations to criterion proof. Retry/stop, missing tools or telemetry cannot become pass. After worker changes, pin the final candidate and perform final verification. The runner does not submit Graph decisions automatically.
