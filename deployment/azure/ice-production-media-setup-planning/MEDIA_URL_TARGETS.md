# Media URL Targets

Generated: 2026-06-04

## Target Domain

```text
media.iceskatingrinkrentals.com
```

## Required Public URL Pattern

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Required Blob Path Pattern

```text
ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Rules

- `{assetId}` must match the approved Ice MediaAsset asset ID.
- `{checksum}` must version the binary content.
- `{safeFileName}` must be sanitized and extension-preserving.
- Production URLs must not use `/media/ice-rink-rentals/...`.
- Production URLs must not use localhost, example domains, placeholder domains, base64 payloads, or unapproved external hosts.
- Checksum-versioned media URLs should remain available for rollback windows.

## Planned MediaAsset Fields

Future MediaAsset updates, after explicit approval, should include:

- `storageProvider=azure-blob`
- `cdnProvider=cloudflare`
- `sourceBlobPath`
- production `publicUrl`
- `thumbnailUrl` or variants when approved
- checksum and safe file metadata
- updated status/readiness metadata

## Readiness Result

Target media URL readiness: planned, not ready.

No target URL was written to CMS or MediaAsset records in this pass.

