# Pack compatibility gate

Each Pack declares a Core semver range, graph/decision/evidence contract versions, and versioned capabilities. Release metadata identifies the deterministic payload in `dist/<pack>/<version>/pack.json`: SHA-256 covers the JSON bytes excluding `release`, avoiding a self-referential digest. The current releases carry `status: candidate` and `builtAt`; tags and remote publication are separate actions.

Test a pinned, extracted Core source artifact, not a mutable sibling checkout. The artifact must contain `src/core/index.mjs` and its imports; the full suite also needs `src/plugin/review-context.mjs`. The current contract artifact contains `src/core/` and that review-context module. It does not certify every host plugin module. Compute the sorted file-tree digest as relative path, NUL byte, file bytes for each file with `scripts/test-compatibility.mjs --core-artifact <path> --print-digest true`; save that digest as the pinned expected value. The test script checks the expected digest and Core runtime version before registration, and records the Core/Pack digest tuple and result in `dist/compat-reports/`.

```powershell
node scripts/test-compatibility.mjs --core-artifact <extracted-Core-0.8.0-artifact> --core-digest sha256:<tree-digest> --core-version 0.8.0
node scripts/test-compatibility.mjs --core-artifact <extracted-Core-0.8.0-artifact> --core-digest sha256:<tree-digest> --core-version 0.8.0 --full-suite true
```

Core 0.7.x is the previous ADLC 0.1.10 compatibility baseline. ADLC 0.2.0 and Marketing 0.0.1 explicitly require `>=0.8.0 <0.9.0`. The local Core 0.8.0 candidate artifact with tree digest `sha256:6241292cc678ef7c877fbc3578d298f399a399090e43d12f6671d03dafcf4dad` passed registration and all 31 Pack tests on 2026-10-29. The exact Pack payload digests are ADLC `sha256:d138a969666124fc0da62c2750aa75f3fc019124bb95725fae9c3498c7a27e12` and Marketing `sha256:d5dac8b69b1983c0ae94e92d142523db90746e6b1299478827afe87ec20ac260`. This is a pinned local candidate result, not a published release. The full behavioral suite tests the ADLC to Marketing release receipt, provenance, contract version, project and target version boundaries.

The host supplies verified release events, sourced metrics, Dashboard read models and independent shadow sessions only when its implementation actually supports them. Optional capability declarations do not imply execution. The host rejects unsupported actions with an audit reason, and Marketing outcome review records unknown when metrics lack a verified source.
