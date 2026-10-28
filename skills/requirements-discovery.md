# Requirements discovery

Use after an intent is accepted, or when an approved request or PRD still has an unclear constraint or acceptance boundary. Use product discovery first when the underlying user problem is unknown.

1. Collect the original request and dated source evidence. Interview the human owner about decisions that cannot be inferred: target users, painful current behavior, desired outcome, non-goals, constraints, and success signal. Record assumptions and open questions separately from facts. Complete when every material claim has a source or is labeled an assumption.
2. Write a versioned intent with owner, problem, affected users, desired outcome, non-goals, success signal, source links, and unresolved decisions. For an incident, attach the observed failure and candidate impact. Complete when the Product Owner can accept, reject, or return the intent with concrete reasons.
3. Turn accepted intent into a spec with why, capabilities, constraints, non-goals, and success signal. Add frontend behavior, backend contracts, error and edge states, security and accessibility requirements where relevant. Give requirements stable IDs and map each acceptance check to one or more IDs. Complete when a reviewer can trace each requirement to intent and each check back to a requirement.
4. Challenge readiness before implementation: can an engineer build the Stories without inventing a product, UX, or architecture decision? Record PASS, CONCERNS, or FAIL with the exact gaps and owners. Resolve blocking gaps and obtain the authorized product acceptance. Keep the intent, spec, decisions, and revision history as versioned handoff artifacts.

Use a short path for a clear small change and fuller discovery for uncertain or high-impact work. The readiness result measures missing decisions, not document length.
