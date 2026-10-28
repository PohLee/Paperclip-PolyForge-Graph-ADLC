# ADLC lifecycle orchestration

Use when selecting the next workflow or handing work across product, design, engineering, verification, release, and maintenance.

1. Classify the entry: idea, planned feature, clear small change, defect, or production signal. Select only the analysis and planning depth needed to expose material decisions. A clear small change may enter implementation with an already approved requirement; a defect enters root-cause investigation first.
2. Carry a versioned chain: sourced intent, accepted spec and requirement IDs, design identity when needed, accepted implementation plan, code and tests, independent review, fixed-candidate verification, and an acceptance decision. Each handoff names the exact predecessor artifacts and unresolved questions. Complete when no downstream claim depends on an unversioned upstream assumption.
3. Route judgment to its authorized owner and preserve the Decision Record before continuing. An agent may draft, compare, test, and recommend; human product or release authority remains with the authenticated owner where required. Scale review to impact and reversibility while keeping the same evidence chain.
4. After acceptance, connect release evidence and production observations to the candidate. A detected regression or unmet success signal becomes a new sourced intent or defect investigation. Complete the loop when the next run cites the incident, decision history, and affected versions.

The pack executes discovery, design, implementation, verification, release preparation, release observation, and one-window monitoring graphs. The host supplies the approved product decision after discovery, actual release execution events, production observations, and any pipeline, scheduling, paging, or recovery capability. The release graphs define operational flow and evidence, not complete release certification.
