# Validator Result

Date: 2026-06-05

## Commands

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run validate:snapshot:ice` | 0 | pass |
| `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out` | 1 | expected strict failure |
| `node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/out` | 1 | expected strict failure |

## Snapshot Validator

Snapshot validator passed.

```text
ok: true
pageCount: 3
fileCount: 5
errors: 0
```

Production-readiness warnings remain for page body/media local URLs and form endpoint readiness.

## Strict Static Output Validator

Strict static output validator failed with 8 errors:

- local-dev media URL in `contact/index.html`
- local-dev media URL in `contact/index.txt`
- local-dev media URL in `index.html`
- local-dev media URL in `index.txt`
- local-dev media URL in `service-areas/index.html`
- local-dev media URL in `service-areas/index.txt`
- static form endpoint is not configured
- static form endpoint/backend verification is missing

## Strict Staging Package Validator

Strict staging package validator failed with the same 8 errors against `apps/ice-rink-web/out`.

## Media URL Diagnosis

The 6 file-level media errors map to 9 distinct local page-body media URLs:

| Route/output files | Unique local media URL count |
| --- | ---: |
| `/` (`index.html`, `index.txt`) | 6 |
| `/contact` (`contact/index.html`, `contact/index.txt`) | 8 |
| `/service-areas` (`service-areas/index.html`, `service-areas/index.txt`) | 6 |

Distinct local URLs still embedded in rendered static output:

- `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png`
- `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png`
- `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png`
- `/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png`
- `/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png`
- `/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png`
- `/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png`
- `/media/ice-rink-rentals/2026/06/partyproseastcoastlogo-cfd1fc9f60ae.png`
- `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png`

These remaining URLs are in CMS page body/media fields and revision snapshot fields. They are not remaining in the 9 updated MediaAsset records.
