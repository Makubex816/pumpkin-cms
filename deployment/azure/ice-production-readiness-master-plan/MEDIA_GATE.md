# Media Gate

Generated: 2026-06-04

## Why Media Is Blocked

Strict validators still find 6 local body/media URL file errors across:

- `index.html`
- `index.txt`
- `contact/index.html`
- `contact/index.txt`
- `service-areas/index.html`
- `service-areas/index.txt`

The remaining local URLs are body/page imagery, not the cleared social metadata image fields.

Approved visible imagery should not be removed to make validators pass.

## Target Media Domain

```text
media.iceskatingrinkrentals.com
```

## Target URL Pattern

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Documented MediaAsset IDs

Existing safe docs document these Ice MediaAsset IDs:

- `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d`
- `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd`
- `ice-rink-rentals-holidayicerink-973ce7691377`
- `ice-rink-rentals-icerinkrentalssetup-113d218572e4`
- `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411`
- `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae`
- `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd`
- `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7`
- `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d`

## Future Required Actions

After explicit approval:

1. Verify final approved MediaAsset inventory.
2. Verify binary sources, checksums, dimensions, MIME types, and safe file names.
3. Create/provision approved media storage.
4. Upload binaries to checksum-versioned Blob paths.
5. Configure/validate Cloudflare media hostname.
6. Update MediaAsset records with production media fields.
7. Rebuild static output.
8. Confirm no local body/media URL errors remain.

## Validation Criteria

- every required image URL uses the target media domain
- no `/media/ice-rink-rentals/...` URLs remain in production-bound output
- no localhost, placeholder, fake, base64, or unapproved external image URLs remain
- cache headers match the immutable versioned media policy
- rollback media URLs remain available

## Explicit No-Action Statement

No Azure Storage, Blob container, upload, Cloudflare change, CMS write, MediaAsset write, or media readiness change occurred in this run.

