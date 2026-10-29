# Paperclip PolyForge Graph Packs

The official collection exports independently versioned domain Packs for [PolyForge Graph Core](../Paperclip-PolyForge-Graph). The root `pack` and default export remain ADLC for existing imports. New hosts should register every entry in `packs` or select one from `packCatalog`.

| Pack | Version | Scope |
| --- | --- | --- |
| [ADLC](packs/adlc/README.md) | `adlc@0.2.0` | Product discovery through observed software release and monitoring |
| [Marketing](packs/marketing/README.md) | `marketing@0.0.1` | Acquisition planning and sourced outcome review |

```js
import { packs, packCatalog } from '@paperclip-polyforge/packs';
for (const pack of packs) await engine.registerPack(pack);
// Existing import { pack } still selects ADLC.
```

Each Pack has its own version, `compatibility` contract, content digest, release artifact, and `packId/vVersion` tag. Earlier ADLC tags and source history remain intact. `node scripts/build-pack.mjs adlc` and `node scripts/build-pack.mjs marketing` write deterministic payloads to `dist/<id>/<version>/pack.json` and verify `release.digest`. After reviewing and committing a package, `node scripts/tag-pack.mjs <id>` creates its annotated tag; it never pushes. `npm run build:roles` refreshes source role documents. `npm test` runs conformance tests.

## Company and project boundaries

The Core and host own one company CEO, reporting to the Board. ADLC CPO and CTO/CAIO, and Marketing CMO, reference that CEO through `reportsToRole:'ceo'`. The Packs do not instantiate another CEO. Agents can hold multiple Pack roles, with host bindings keyed by `packId:roleId`. Each run and cross-Pack plan carries the same company and project identity; a project may have ADLC and Marketing work concurrently. The CEO pins a `goal.md`/OKR plan version to delegated tasks. Later plan edits affect NEW tasks only. Every decision is recorded. A role rejects an out-of-scope request with a reason and sends it to the CEO for routing. Mandatory human decisions, unresolved conflict, and authority outside CEO scope reach the authenticated human owner.

Artifact self review stops when P0/P1 findings are resolved or after five rounds, then goes to the Graph reviewer with full attempt history. Any shadow reviewer requires a real independent host execution, closure after the task, and retained audit. A role label alone cannot establish independence. The candidate host advertises `shadow-review-execution` only for its exact deterministic local process fixture with an existing budget and a bounded timeout. Production model Shadows and per-session currency caps remain unavailable; an optional Pack declaration does not enable them.

## ADLC to Marketing handoff

`adlc.release-to-marketing@1` is declared in ADLC `handoffContracts` and Marketing `incomingHandoffs`. The host may record it only after `release-observation` reaches `release_recorded` from a verified host execution event and authenticated release outcome. The completed `record-release-execution` node produces a `release_execution_record` with a content digest and exact source references to the pinned execution event, candidate, and release authorization. A trusted host provider authenticates a release evidence receipt whose subject references include that record ID/version/digest. The handoff binds the shared `projectId`, source and target Pack/Graph versions, the receipt, product decision and knowledge references. The target is `marketing/acquisition-plan`; it produces a proposal, not a campaign launch. External publication or spend needs separate human authorization and execution capability.

Marketing outcome review requires metric source, definition, observation window, freshness and baseline. Missing, stale or unauthenticated metrics route to `measurement_unknown`; no success number is inferred. Product decisions, supersession links and change history remain available across the handoff.

## Compatibility

| Core artifact | ADLC 0.1.10 | ADLC 0.2.0 | Marketing 0.0.1 | Evidence |
| --- | --- | --- | --- | --- |
| Existing Core 0.7.x baseline | Supported by prior ADLC release | Incompatible by declared range | Incompatible by declared range | Prior tag retained; declared `>=0.8.0 <0.9.0` for new Packs |
| Proposed Core 0.8.0 local candidate | Outside prior release claim | Passes pinned artifact tests | Passes pinned artifact tests | Local contract artifact `sha256:6241292cc678ef7c877fbc3578d298f399a399090e43d12f6671d03dafcf4dad`; 31/31 Pack tests pass |

The 0.8.0 row is a local source snapshot, not a published Core release. The pinned artifact report identifies ADLC payload `sha256:d138a969666124fc0da62c2750aa75f3fc019124bb95725fae9c3498c7a27e12` and Marketing payload `sha256:d5dac8b69b1983c0ae94e92d142523db90746e6b1299478827afe87ec20ac260`. All 31 Pack tests ran against that pinned artifact, including the receipt and target version handoff checks. `docs/COMPATIBILITY.md` describes the artifact gate. Host capabilities are declared by ID and version: Core company control, cross-Pack plans and handoffs are required; sourced metrics, verified release events, shadow execution and Dashboard read models are gated at the affected route.
