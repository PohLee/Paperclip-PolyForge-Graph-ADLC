# Systematic debugging

Use for a defect, failing test, unexpected behavior, integration failure, or performance regression before changing implementation code.

1. Investigate the root cause. Preserve the full error, environment, recent changes, and exact reproduction steps. Reproduce consistently or record the missing signal. Trace the bad value or behavior backward across component boundaries and gather enough instrumentation to locate the first divergence. Complete when the failure and its likely origin are supported by observed evidence.
2. Compare the failing path with a nearby working path and relevant interfaces. List meaningful differences and dependencies. Complete when a specific difference explains why this path fails and the other succeeds, or the unknown is explicit.
3. State one falsifiable root-cause hypothesis and test it with the smallest diagnostic change. Record the result before forming another hypothesis. Complete when the hypothesis is confirmed by a repeatable observation; otherwise return to investigation.
4. Capture the failure in a test or executable reproduction that is red for the expected reason. Fix the cause in one focused change, then rerun that check and neighboring regression checks. Record commands, outputs, candidate version, and residual uncertainty. Complete when the original symptom is absent and the relevant checks pass on the changed candidate.

After three failed fixes against the same premise, stop the patch loop and review the underlying architecture with the technical owner. If the cause is external or intermittent, record the investigation and add a measurable detection or recovery path.
