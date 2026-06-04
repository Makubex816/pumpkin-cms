# Media Validation Plan

Generated: 2026-06-04

## Scope

This is a future validation plan only. No validation was executed as production media setup, because production media infrastructure is not approved or provisioned.

## Pre-Setup Validation

Before any upload or write:

- confirm approved MediaAsset inventory
- confirm approved binary source for each asset
- confirm checksum, MIME type, dimensions, and safe file name
- confirm alt text and usage
- confirm route usage on `/`, `/contact`, and `/service-areas`
- confirm no asset is missing from the future upload list

## Post-Upload Validation

After explicit approval and upload:

- confirm each Blob exists at the expected path
- confirm checksum matches approved metadata
- confirm HTTPS media URL loads
- confirm cache headers match policy
- confirm Cloudflare routes the media hostname correctly
- confirm rollback path availability

## Post-MediaAsset-Update Validation

After explicit approval and MediaAsset writes:

- re-read MediaAsset records
- confirm `storageProvider=azure-blob`
- confirm `cdnProvider=cloudflare`
- confirm production `publicUrl`
- confirm production `sourceBlobPath`
- confirm no local `/media/ice-rink-rentals/...` URL remains in production-bound fields

## Static Output Validation

After approved media setup:

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
```

Then run:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

Expected media result after approved setup:

- no local body/media URL errors
- no unapproved image URL errors
- media production URL readiness may be marked `yes` only after all checks pass

## Current Status

Media validation plan: documented.

Media validation executed: no.

