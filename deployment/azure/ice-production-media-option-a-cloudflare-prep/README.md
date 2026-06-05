# Ice Option A Cloudflare Prep

Date: 2026-06-05

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Scope

This package prepares the future Cloudflare/DNS execution plan for Option A media delivery. It is planning only.

No Cloudflare, DNS, Cloud Connector, rewrite rule, cache rule, CMS, MediaAsset, deployment, email, Microsoft 365, or Roller change occurred.

## Selected Strategy

Option A is selected:

```text
Public checksum-versioned Azure Blob media served behind Cloudflare at media.iceskatingrinkrentals.com.
```

## Required Mapping

Public URL:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Azure origin URL:

```text
https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Cloudflare must route/rewrite the public path to the Azure origin path that includes the `ice-rink-rentals-media` container segment.

## Current Status

Direct public Azure Blob URLs are readable for all 9 approved media files after Phase 1B.

Cloudflare execution still requires a separate explicit approval. No Cloudflare/DNS changes occurred in Phase 1B.

## Files

- `CLOUDFLARE_DNS_TARGET.md`
- `CLOUDFLARE_PATH_REWRITE_PLAN.md`
- `CLOUDFLARE_CACHE_RULE_PLAN.md`
- `CLOUDFLARE_CLOUD_CONNECTOR_PLAN.md`
- `ORIGIN_URL_MAPPING.md`
- `PUBLIC_URL_VALIDATION_PLAN.md`
- `MEDIAASSET_UPDATE_DEPENDENCY.md`
- `NEXT_CLOUDFLARE_EXECUTION_APPROVAL_REQUIRED.md`
- `NEXT_CLOUDFLARE_EXECUTION_PROMPT.md`
- `manifest.json`
