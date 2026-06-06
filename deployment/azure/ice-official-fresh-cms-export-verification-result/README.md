# Ice Official Fresh CMS Export Verification Result

Generated: 2026-06-06

## Result

Passed.

The refreshed admin auth was accepted by the CMS admin API, the official full CMS-backed export command completed with exit `0`, the fresh CMS snapshot was route-scoped to the approved Ice pages, and strict static/staging validators passed.

No CMS writes, MediaAsset writes, Function setting changes, Azure/Cloudflare changes, email sending, deployment, protected config file reads, generated artifact staging, or Roller work occurred.

## Evidence Summary

| Gate | Result |
| --- | --- |
| required env presence | all present by name; values not printed |
| `GET /api/auth/verify` | `200` |
| `GET /api/admin/pages?tenantId=...` | `200` |
| `GET /api/admin/themes/{tenantId}/active` | `200` |
| `npm run export:static:ice:cms` | exit `0` |
| CMS snapshot slugs | `contact`, `home`, `service-areas` |
| generated content routes | `/`, `/contact`, `/service-areas` |
| copied artifact routes | `/`, `/contact`, `/service-areas` |
| preview/obsolete deployable paths | `0` |
| public `/media/ice-rink-rentals/...` strings | `0` files |
| public `latestSnapshot` mentions | `0` files |
| rendered local `<img src="/media/...">` | `0` files |
| production media URLs checked | `9`, failures `0` |
| static form endpoint `OPTIONS` | `204` |
| strict static output validator | pass, 42 files, 0 errors, 0 warnings |
| strict staging package validator | pass, 42 files, 0 errors, 0 warnings |

## Files

- `AUTH_PROBE_RESULT.md`
- `PRE_EXPORT_EXTERNAL_READINESS_CHECK.md`
- `OFFICIAL_CMS_EXPORT_RESULT.md`
- `ROUTE_PROOF_RESULT.md`
- `MEDIA_AND_FORM_READINESS_RECHECK.md`
- `VALIDATOR_RESULT.md`
- `REMAINING_BLOCKERS.md`
- `NEXT_AZURE_STAGING_APPROVAL_REQUIRED.md`
- `ROLLBACK_NOTES.md`
- `manifest.json`
