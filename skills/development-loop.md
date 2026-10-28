# Development loop

Use for implementation, refactoring, or a bug fix after the requirement and candidate boundary are pinned.

When the host binds the Core check runner, follow check-execution for setup, bounded worker/check feedback, timeout and logs. Missing checks stay unverified. Pin the final integrated candidate after worker changes, then obtain independent review and verification on that version.

1. Choose the smallest change that delivers the accepted outcome. Name the data shape, affected interfaces, protected behavior, and checks before editing. Record architecture choices where a boundary or contract changes. Complete when the plan exposes dependencies and a reviewer can identify the intended diff.
2. Work in small executable slices. For a bug, start from the red reproduction in systematic debugging. For a new behavior with a useful automated seam, run red, green, refactor; otherwise choose an observable check before implementation. Keep tests independent of the implementation detail they verify. Complete each slice when the observed behavior matches the criterion.
3. Run the project's build, relevant tests, lint or type checks, and direct behavior checks. For UI changes, inspect the rendered state and edge states. Keep literal command results and candidate versions; resolve failures in code or explain a justified test change. Complete when the required checks pass or the blocked checks are explicitly marked unverified.
4. Self review the diff against the spec, neighboring behavior, security, and unnecessary complexity. Submit it for independent review with remaining findings, exact versions, and retest scope. Complete when acceptance cites current evidence and the retrospective records any reusable correction to the environment or method.

Parallel work requires independent boundaries, separate artifact identities, and an integration check after joining. The host must provide and authorize any delegated runtime.
