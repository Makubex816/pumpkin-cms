# Remaining Strict Validator Errors

Generated: 2026-06-04

## Scope

This is a diagnosis-only pass for IceSkatingRinkRentals.com after the approved CMS metadata repair.

No CMS records, Theme records, MediaAsset records, media files, Azure resources, DNS/Cloudflare settings, Microsoft 365 settings, email, deployment state, generated artifacts, or Roller records were changed.

## Route Proof

Current route-shape proof remains clean:

| Check | Result |
| --- | --- |
| snapshot slugs | `contact`, `home`, `service-areas` |
| `apps/ice-rink-web/out` routes | `/`, `/contact`, `/service-areas` |
| copied artifact routes | `/`, `/contact`, `/service-areas` |
| preview/obsolete deployable paths | 0 |
| `npm run validate:snapshot:ice` | pass, exit `0` |

Noindex errors remain cleared. The prior unapproved rendered social image URL remains cleared.

## Strict Static Output Validator

Command:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out
```

Result: fail as expected, exit `1`, 8 errors.

| # | Category | Route/page | Rendered file/path | Source path if identifiable | Classification |
| ---: | --- | --- | --- | --- | --- |
| 1 | local-dev media URL | `/contact` | `contact/index.html` | active `contact` page body/media objects | local body/media URL |
| 2 | local-dev media URL | `/contact` | `contact/index.txt` | active `contact` page body/media objects | local body/media URL |
| 3 | local-dev media URL | `/` | `index.html` | active `home` page body/media objects | local body/media URL |
| 4 | local-dev media URL | `/` | `index.txt` | active `home` page body/media objects | local body/media URL |
| 5 | local-dev media URL | `/service-areas` | `service-areas/index.html` | active `service-areas` page body/media objects | local body/media URL |
| 6 | local-dev media URL | `/service-areas` | `service-areas/index.txt` | active `service-areas` page body/media objects | local body/media URL |
| 7 | static form endpoint not configured | global static form gate | not file-specific | env/config read by validator | missing static form endpoint |
| 8 | static form endpoint/backend verification missing | global static form gate | not file-specific | env/config read by validator | missing/unverified static form endpoint |

## Strict Staging Package Validator

Command:

```powershell
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

Result: fail as expected, exit `1`, 8 errors.

| # | Category | Route/page | Rendered package path | Source path if identifiable | Classification |
| ---: | --- | --- | --- | --- | --- |
| 1 | local-dev media URL | `/contact` | `contact/index.html` | active `contact` page body/media objects | local body/media URL |
| 2 | local-dev media URL | `/contact` | `contact/index.txt` | active `contact` page body/media objects | local body/media URL |
| 3 | local-dev media URL | `/` | `index.html` | active `home` page body/media objects | local body/media URL |
| 4 | local-dev media URL | `/` | `index.txt` | active `home` page body/media objects | local body/media URL |
| 5 | local-dev media URL | `/service-areas` | `service-areas/index.html` | active `service-areas` page body/media objects | local body/media URL |
| 6 | local-dev media URL | `/service-areas` | `service-areas/index.txt` | active `service-areas` page body/media objects | local body/media URL |
| 7 | static form endpoint not configured | global static form gate | not file-specific | env/config read by validator | missing static form endpoint |
| 8 | static form endpoint/backend verification missing | global static form gate | not file-specific | env/config read by validator | missing/unverified static form endpoint |

## Diagnosis

All remaining strict errors are expected production-readiness blockers:

- local body/media URLs rendered from approved page media and content-block media fields
- missing/unverified static form endpoint configuration

No unexpected strict validator category was found.

The strict validators are correct to keep failing. Passing them would require production media URLs and a verified static form endpoint, both of which are outside this local diagnosis pass.
