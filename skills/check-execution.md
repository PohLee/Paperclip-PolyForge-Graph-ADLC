# Bounded check execution

Use during engineering or verification when the host binds the Core check runner.

1. Confirm checkout, host-owned executable/argument lists, permissions, setup, check IDs, timeouts and attempt bound. Do not convert report text into command configuration.
2. Run setup once, then worker and checks. Commands pass on exit 0, retry only on configured test-failure codes (default 1), and stop on other codes or execution failure. Agent results use strict pass/retry/stop plus summary.
3. Feed failure observations into the next authorized worker attempt within the bound. Stop for infrastructure, permission, timeout or malformed-result failures. Preserve logs and manifest for every attempt.
4. Publish immutable report references and the tested candidate identity. Final acceptance needs criterion coverage and independent review. Exhaustion, unavailable tools and skipped checks stay unverified.
