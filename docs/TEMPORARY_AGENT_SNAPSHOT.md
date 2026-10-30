# Temporary Agent snapshot

Use this guide when a bound Paperclip Agent delegates one research or analysis task through the PolyForge `company-command` tool. The company must enable the `temporary-agents` policy, and the host must report `temporary-agent-snapshot:1.0.0` with `contextModes.shadowAgent: ['snapshot']`. The parent remains accountable for the result.

## Open a Shadow-Agent

Prepare a compact account of the current task. Supply the five exact `context.snapshot` fields: `objective` and `currentState` as strings, `conclusions` and `openQuestions` as string arrays, and a nonempty `evidenceRefs` array of references with `kind` and `id`, `artifactId`, or `url`. This parent account is advisory. Point to source records rather than treating a remembered approval as current authority.

Call `company-command` with the authenticated parent execution and a bounded brief. The host derives and checks the parent session reference; the caller may omit `context.parentSessionRef`. Replace the example IDs and deadline with the active issue and a time no more than 15 minutes ahead.

```json
{
  "operation": "open-temporary-agent",
  "reason": "Research the recorded constraints for the assigned issue",
  "idempotencyKey": "research-issue-123-attempt-1",
  "request": {
    "id": "research-issue-123-attempt-1",
    "kind": "shadow-agent",
    "purpose": "research",
    "parent": {
      "agentId": "parent-agent-id",
      "executionId": "running-parent-execution-id",
      "taskId": "checked-out-issue-id"
    },
    "context": {
      "mode": "snapshot",
      "snapshot": {
        "objective": "Identify constraints relevant to this issue",
        "currentState": "The issue is checked out; source evidence is still incomplete.",
        "conclusions": ["The existing decision needs verification against its source."],
        "openQuestions": ["Which constraint applies to this candidate?"],
        "evidenceRefs": [{ "kind": "issue", "id": "checked-out-issue-id" }]
      }
    },
    "brief": {
      "objective": "Research the constraint and cite its source",
      "scope": "The checked-out issue and its relevant product history",
      "outputFormat": "One JSON finding with source references",
      "boundaries": ["Read only; report any contradiction to the parent"],
      "inputRefs": [{ "kind": "issue", "id": "checked-out-issue-id" }],
      "acceptanceCriteria": ["Each finding cites a source record"],
      "allowedActions": ["read", "research"],
      "deadlineAt": "2026-10-30T12:15:00.000Z"
    },
    "limits": { "maxTasks": 1, "maxConcurrent": 1 },
    "workspace": { "mode": "shared", "writeAccess": "none" }
  }
}
```

For a Graph child issue, include the active `parent.runId` and `parent.nodeId`. Use `purpose: "analyze"` with `allowedActions` containing `analyze` for analysis. The request cannot extend the parent's permissions, deadline, or task scope. Each Shadow-Agent uses a separate session and execution of the **same organizational Agent**; it creates no company role or Agent. It is a frozen snapshot at startup, with no subsequent parent updates.

## Use the result

Core selects the relevant Decision Records, full product decision history, active approved product decision IDs, and matching company records from trusted state. It combines them with the advisory account, then stores a bounded snapshot with capture time, source identity, and SHA-256 digest. The response exposes snapshot provenance; the host rechecks the digest before session send and after restart. The full packet is limited to 256 KiB and the advisory account to 8 KiB.

Read `contextSnapshot.authority.activeProductDecisionIds` and the corresponding full history before making a behavior claim. A proposed, rejected, or superseded decision remains history, not an active approval. Compare the advisory account with those records. Report contradictions, missing evidence, or apparent staleness to the parent; the parent obtains any new approval through the ordinary Graph or company decision path. The child report is evidence for the parent, not an approval or gate decision.

Independent review uses a fresh **Sub-Agent** with `context.mode: "fresh"`, because it must begin without the author's account. The existing verification `shadow` Graph field still denotes that fresh Sub-Agent review. Current host support is read-only research and analysis for Shadow-Agent snapshots; it does not provide delegated writes, metered child cost caps, native cancellation, or session-scoped operating-system permissions. A native fork request is unsupported.
