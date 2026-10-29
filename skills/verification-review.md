# Verification and security review

Use after a fixed implementation candidate is pinned.

At acceptance-matrix, use `pack.policyDocuments.evidenceContracts` for exact output: current candidate references and one row per input criterion, with pass/fail/unverified, observed proof and gaps. Failed criteria block acceptance. Only an authenticated human owner may accept unverified with reason, risk and matrix-version reference; agents must escalate.

1. Read the exact candidate identity, approved PRD criteria, active product decisions, and prior protected behavior. Select independent QA, regression, and security checks. For user-facing application behavior, use application-verification to maintain a project-local recipe and feature map; supply its proven `project_verification` profile when available.
2. Run the authorized checks. Record environment, command or procedure, expected and observed result, source, candidate version, and severity for each finding. Mark checks that could not run as untested.
3. For security, cover relevant threat surfaces, exploit conditions, controls, and residual risk. An external scanner or security skill is usable only when the host confirms its installation and permission.
4. Complete when reports bind to the fixed candidate and the acceptance gate has current QA, regression, and security evidence. A changed candidate requires fresh affected checks; unresolved P0/P1 findings go to the Graph-designated reviewer and cannot gain approval from the self-review round limit.
