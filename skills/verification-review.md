# Verification and security review

Use after a fixed implementation candidate is pinned.

1. Read the exact candidate identity, approved PRD criteria, active product decisions, and prior protected behavior. Select independent QA, regression, and security checks.
2. Run the authorized checks. Record environment, command or procedure, expected and observed result, source, candidate version, and severity for each finding. Mark checks that could not run as untested.
3. For security, cover relevant threat surfaces, exploit conditions, controls, and residual risk. An external scanner or security skill is usable only when the host confirms its installation and permission.
4. Complete when reports bind to the fixed candidate and the acceptance gate has current QA, regression, and security evidence. A changed candidate requires fresh affected checks; unresolved P0/P1 findings go to the Graph-designated reviewer and cannot gain approval from the self-review round limit.
