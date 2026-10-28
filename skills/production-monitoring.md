# Production monitoring

Use for one host-supplied production observation window, a release follow-up, or an alert requiring triage.

1. Pin a versioned monitoring plan before evaluating a window. It names the service, owner, protected user outcome, each SLI or documented baseline, calculation and data source, threshold, observation window, freshness limit, and action owner. Mark unknown targets explicitly. Then pin the environment, deployed candidate when known, time window, telemetry sources, and freshness. Complete when the plan and observation can be reproduced from their versions, sources, and window.
2. Compare symptoms that users experience with the baseline. Inspect latency, traffic, errors, and saturation where relevant, plus logs or traces to diagnose a deviation. Distinguish an actionable breach from noise and note missing or stale data. Complete when every claimed deviation has a measured value, threshold, and source.
3. Route healthy, watch, investigate, or insufficient data. A watch record names its owner, threshold, and next observation; an investigation records impact, first failing signal, time window, candidate, and incident owner. A data gap records what cannot be concluded and who will restore the signal. Complete when the disposition is recorded before notification or handoff.
4. Link an incident to systematic debugging and the affected product decisions. Feed repeated user needs or a missed success signal into product discovery. After a fix or release, compare a new observation window with the original signal. Complete when the follow-up cites the original and current evidence.

Telemetry ingestion, scheduled runs, paging, and automatic rollback require host integrations. The pack evaluates supplied evidence and records the next action.
