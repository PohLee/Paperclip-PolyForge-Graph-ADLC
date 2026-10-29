# Matt Pocock skills and pstack: four ADLC adaptations

Implementation target: ADLC `0.1.9` with Core `0.6.0`. Research and source versions are recorded in [MATT_PSTACK_RESEARCH.md](MATT_PSTACK_RESEARCH.md). These are local adaptations, not installed upstream plugins. Existing uncommitted Core `0.5.0` and ADLC `0.1.8` work is the base for this increment.

| Improvement | Pack route and owner | Runtime enforcement | Host boundary |
| --- | --- | --- | --- |
| Reusable real-application proof | `application-verification` for QA and LE; optional `project_verification` input to verification `0.1.3` | Core validates versioned recipe identity, Launch/Doctor/Drive/Evidence/Cleanup references, unique feature map and a mapped proof run whose evidence survived cleanup | Host runs the recipe, isolates the app, verifies side effects and publishes actual proof; an absent profile does not imply application behavior passed |
| Ticket dependencies and ready frontier | `ticket-planning` for PM, PO, PE and LE; implementation `0.1.4` plan and integration outputs | Core rejects unknown/cyclic blockers, computes ready IDs with `readyWorkTickets`, and requires every ticket once with observed evidence on the exact integrated candidate | Tracker/host maintains completed IDs, validates proof authenticity and dispatches only ready tickets |
| Recoverable request intake | `request-triage` skill and optional Graph `request-triage@0.1.0`, owned by PO with analyst support | Core checks source identity, report fields, confirmed bug reproduction before ready, report/decision agreement, and a follow-up link to a prior `needs-info` report for the same request | Host searches tracker/history, verifies external links and reporter updates, and owns labels/comments; a ready brief routes into existing Graphs |
| Repeated error guardrails | `correction-guardrails` for PE and QA, extending the Core intervention ledger | A human owner can graduate a proposal only when it cites two distinct interventions, an enforcement mechanism and a recorded failing negative control | Host confirms the old error was replayed, corrected path passes, and later behavior evaluations show the intended effect |

The [evidence contract](EVIDENCE_CONTRACTS.md) contains exact payloads and unresolved authenticity boundaries. New run versions preserve older pinned runs. `release-process` still stops before host execution: no pipeline is selected, and these changes do not grant release certification or automatic production authority.

## Verification

Pack tests exercise all three triage dispositions, the ticket frontier, four implementation shapes and integrated ticket proof. Core tests reject an unconfirmed ready bug, a mismatched triage decision, invalid follow-up, unknown/cyclic blockers, incomplete ticket coverage, a profile whose proof disappears during cleanup, and improvement graduation without a negative control. Build and full Core/Pack regression results must be recorded separately for the exact working tree.
