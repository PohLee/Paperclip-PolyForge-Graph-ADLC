# Product memory check

Use before changing a feature or accepting a product behavior change.

1. Identify the affected feature and retrieve active product decisions, linked change history, known constraints and prior incidents. Record each source ID and version. In a Shadow-Agent snapshot, use Core-selected `authority.activeProductDecisionIds` and full history at capture time; treat the parent account as advisory.
2. Compare the proposed behavior with the approved behavior. Mark missing or conflicting context as unresolved; request a product decision when the change alters approved behavior.
3. For an approved-behavior change, record a proposed replacement with feature, superseded Decision ID, outcome and change scope. Obtain human approval of that matching proposal; link its proposal ID and the superseded decision. Keep all records and reasons discoverable.
4. Report any contradiction or apparent stale approval in a Shadow-Agent snapshot to the parent. Complete only when the change cites the current active decision set and matching approval, or is waiting on an explicit product decision. An unknown behavior impact remains unresolved until classified.
