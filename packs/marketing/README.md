# Marketing Pack 0.0.4

This source Pack targets Core `>=0.8.5 <0.9.0`. This is a minimal execution Pack with a CMO, Growth Strategist, Marketing Analyst, two Graphs, decision matrices, role documents and bundled skills. The company has one CEO; CMO reports to it. A Marketing Pack does not create a second executive.

`acquisition-plan@0.0.1` starts from a persisted `adlc.release-to-marketing@1` handoff, whose source is an actually observed ADLC release with a content-digested execution record and an authenticated host receipt. Core pins the target Pack/Graph version and shared project. It pins product history, drafts bounded channel hypotheses, checks risks, and records a CMO disposition. `acquisition_plan_ready` means a reviewed proposal. It carries no authority to publish, message, or spend.

`outcome-review@0.0.1` checks one observation window against the pinned plan and baseline. The host authenticates metrics. An absent, stale or unverified source produces `measurement_unknown`; the CMO cannot infer a successful outcome. Every decision cites exact evidence versions. Role instructions define out-of-scope rejection, CEO rerouting, human escalation, self-review limits, and review independence.

Build role Markdown with `node packs/marketing/scripts/build-roles.mjs`. Build its immutable payload with `node scripts/build-pack.mjs marketing`.

For bounded research or analysis, a parent Agent may open a same-Agent Shadow-Agent with a frozen snapshot when `temporary-agent-snapshot:1.0.0` is available. Its parent summary is advisory; Core-selected decisions and active approvals govern behavior. Independent review uses a fresh Sub-Agent. The bundled `temporary-agent-snapshot` skill carries the request and limits.
