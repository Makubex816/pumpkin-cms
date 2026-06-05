# Option A Selected

## Decision

Option A is selected for Ice media delivery:

```text
Public checksum-versioned Azure Blob media served behind Cloudflare at media.iceskatingrinkrentals.com, with path rewrite to the Azure container-backed origin.
```

## Selected On

```text
2026-06-05
```

## Execution Status

Phase 1B completed the Azure direct public Blob readiness step.

The selected strategy remains blocked on Cloudflare/DNS execution and later MediaAsset updates. Full media production URL readiness is still `no` until `media.iceskatingrinkrentals.com` is configured and validated.
