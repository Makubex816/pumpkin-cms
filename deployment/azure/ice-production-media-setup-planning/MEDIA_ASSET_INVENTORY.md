# Media Asset Inventory

Generated: 2026-06-04

## Scope

This inventory is planning-only and is based on existing safe readiness docs, especially `deployment/azure/ice-static-dry-run-readiness/BODY_MEDIA_URL_BLOCKER_AUDIT.md`.

No CMS or MediaAsset records were read live or changed in this pass.

## Documented Ice MediaAsset IDs

These MediaAsset IDs are already documented as active snapshot media used by approved visible page imagery:

| MediaAsset ID | Asset ID | Routes documented | Current blocker type |
| --- | --- | --- | --- |
| `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | `winterfesticerinkrentals-324b1b89777d` | `/`, `/contact`, `/service-areas` | local body/media URL |
| `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | `corporateicerinkrentalevent-18e985ca59bd` | `/`, `/contact`, `/service-areas` | local body/media URL |
| `ice-rink-rentals-holidayicerink-973ce7691377` | `holidayicerink-973ce7691377` | `/`, `/contact`, `/service-areas` | local body/media URL |
| `ice-rink-rentals-icerinkrentalssetup-113d218572e4` | `icerinkrentalssetup-113d218572e4` | `/`, `/service-areas` | local body/media URL |
| `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | `iceskatingrinkrentalslogo-0d1f970f0411` | `/`, `/contact`, `/service-areas` | local body/media URL |
| `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | `partyproseastcoastlogo-cfd1fc9f60ae` | `/`, `/contact`, `/service-areas` | local body/media URL |
| `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | `chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | `/contact` | local body/media URL |
| `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | `chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | `/contact` | local body/media URL |
| `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | `chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | `/contact` | local body/media URL |

## Required Future Verification

Before upload or MediaAsset updates, a separately approved media task must verify:

- source binary exists and is approved
- checksum
- safe file name
- MIME type
- dimensions
- alt text
- usage status
- rollback retention requirement
- production `publicUrl`
- production blob path

## Not Performed

- no media binary lookup
- no media upload
- no Azure Storage or Blob container creation
- no MediaAsset write
- no CMS write

