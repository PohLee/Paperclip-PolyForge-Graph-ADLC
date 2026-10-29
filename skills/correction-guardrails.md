# Correction guardrails

Use when the human intervention ledger shows the same mistake class at least twice and an improvement is proposed for future runs.

1. Group interventions by the actual repeated failure, not by similar wording. Link two distinct recorded interventions and describe the outcome signal to improve.
2. Fix the cause at the highest effective level: simplify the architecture or ownership, then use types, lint or a deterministic check, then a behavioral test. Use an agent instruction only for a judgment that those mechanisms cannot enforce.
3. Re-run a real past error as a negative control. The new guard must fail on that error and pass on the corrected path. Record the command, observed failure, source artifacts, and any limits of the check.
4. Propose the mechanism and evidence in the Core ledger. An authenticated human owner may graduate it only with the two interventions, enforcement proof, negative control and outcome signal; later evidence may reopen or retire it. Complete when the guard is reproducible and its effect can be compared in later behavior evaluations.
