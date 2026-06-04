# Media Execution Rollback Plan

Generated: 2026-06-04

## Scope

Future rollback plan only. No rollback action occurred in this preparation pass.

## Rollback Values To Capture Before Writes

Before MediaAsset updates:

- current `publicUrl`
- current `url`, if separate
- current storage/provider fields
- current source path fields
- current checksum/safe filename metadata
- current status/readiness metadata
- server-managed revision or ETag, if available

## Rollback Triggers

- CDN URL does not load
- wrong image loads
- cache headers are incorrect
- static export still contains local media URLs
- route proof regresses
- unrelated MediaAsset records change
- Cloudflare media hostname fails HTTPS or routing

## Rollback Actions

Only with explicit approval or a pre-approved incident policy:

1. Restore previous MediaAsset values for the 9 approved records.
2. Keep old local media files available during rollback.
3. Keep uploaded checksum-versioned Blob paths available.
4. Revert Cloudflare media DNS/cache changes only if they caused the issue.
5. Purge Cloudflare cache only if approved or required by incident policy.
6. Rerun static export and validators.
7. Verify `/`, `/contact`, and `/service-areas`.
8. Document the incident and next action.

## Blob Rollback Policy

Do not delete uploaded checksum-versioned blobs during the initial rollback window unless explicitly approved. Keeping old and new checksum paths available is safer than removing assets while validators and caches settle.

## Current Run Result

Rollback plan documented only.
