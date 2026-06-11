# Live-Write-Approved Blocker Resolution

V2.2.1 blocked on:

```text
LIVE_WRITE_APPROVED_UNAVAILABLE
```

V2.2.2 resolves that blocker only for the explicit scoped Azure Cosmos staging adapter path.

Still blocked:

- generic `live-write-approved` execution outside the adapter
- old staging-simulated executor live writes
- `production-runtime`
- any wrong provider profile, batch ID, approval manifest, target, tenant/site, or missing `OLM_STAGING_*` contract

The old local/staging-simulated executor behavior remains unchanged.
