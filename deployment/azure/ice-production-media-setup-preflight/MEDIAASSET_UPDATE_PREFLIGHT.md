# MediaAsset Update Preflight

Generated: 2026-06-04

## Scope

This is a future MediaAsset update plan only. No CMS records or MediaAsset records were read live or changed. No Admin JWT was used.

## MediaAsset Records Requiring Future Production URLs

The following MediaAsset records will eventually need production CDN URL fields:

- `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d`
- `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd`
- `ice-rink-rentals-holidayicerink-973ce7691377`
- `ice-rink-rentals-icerinkrentalssetup-113d218572e4`
- `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411`
- `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae`
- `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd`
- `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7`
- `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d`

## Expected Old State

Current production-blocking local URL shape:

```text
/media/ice-rink-rentals/2026/06/{safeFileName}
```

Expected current provider/status context from safe docs:

- storage provider: local-dev
- MediaAsset-backed page imagery
- body/page media URLs still local
- media production URL readiness: no

## Expected New State

Future target public URL shape:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Expected future fields or equivalents:

- storage provider set to Azure Blob
- CDN provider set to Cloudflare
- source Blob path recorded
- production public URL recorded
- checksum metadata recorded
- safe filename metadata recorded
- status/readiness metadata updated only after validation

Exact field names must be confirmed against current application contracts during the approved execution task.

## Readback Verification Requirements

After an approved write:

1. re-read each updated MediaAsset record
2. confirm old local `/media/ice-rink-rentals/...` URL is not present in production-bound URL fields
3. confirm production CDN URL exactly matches the target map
4. confirm source Blob path exactly matches the approved path
5. confirm checksum, safe filename, MIME type, and usage metadata match the upload source
6. confirm no unrelated MediaAsset records changed
7. confirm no CMS page body content changed unless separately approved

## Rollback Approach

Before writing MediaAsset updates:

- capture old values for all fields being changed
- keep local media files available until rollback window closes
- keep all uploaded checksum-versioned Blob paths available
- prepare a reverse patch or write plan that restores old values
- document how validators are expected to fail again if rollback returns to local URLs

## Required Approval Before Writes

Explicit user approval is required before:

- reading protected config or using Admin JWT
- making CMS writes
- making MediaAsset writes
- changing URL fields
- changing provider/status/readiness fields
- marking media production URL readiness `yes`

If Admin JWT is needed for an approved read-only inspection, print only presence/absence status and never print the JWT value.

## Current Run Result

No CMS writes occurred. No MediaAsset writes occurred. No Admin JWT was used.
