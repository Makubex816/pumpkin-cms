# Next Media Delivery Approval Required

## Current Blocker

Cloudflare API credentials are not available in the active Codex shell.

Missing names:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ZONE_ID
```

## Before Media Delivery Setup

Make the required Cloudflare authentication available to the active shell or provide another approved safe mechanism.

Do not print token values.

## Next Approval Shape

After credentials are available, request a media-only Cloudflare execution approval that covers only:

- `media.iceskatingrinkrentals.com`
- DNS/proxy setup for the media hostname
- path rewrite from `/ice-rink-rentals/assets/*` to the Azure Blob container-backed origin path
- cache behavior for checksum-versioned media paths
- validation of all 9 public media URLs

Do not include:

- root/apex DNS cutover
- `www` DNS changes
- CMS writes
- MediaAsset writes
- deployment
- email/Microsoft 365 work
- Roller work

