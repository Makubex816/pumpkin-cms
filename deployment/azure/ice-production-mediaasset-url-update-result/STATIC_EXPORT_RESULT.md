# Static Export Result

Date: 2026-06-05

## Command

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
```

## Result

Exit code:

```text
0
```

Snapshot result:

```text
pageCount: 3
publishedCount: 3
themeSnapshot: true
snapshot slugs: contact, home, service-areas
```

Route output:

| Location | Expected approved routes | Result |
| --- | --- | --- |
| `apps/ice-rink-web/out` | `/`, `/contact`, `/service-areas` | present |
| `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` | `/`, `/contact`, `/service-areas` | present |

Preview/obsolete deployable paths:

| Path | Result |
| --- | --- |
| `/draft-preview` | absent |
| `/ice-rink-rentals` | absent |
| `/events-holiday-activations` | absent |

The export still reported production-readiness warnings for CMS page body/media fields that contain local `/media/ice-rink-rentals/...` URLs. Those fields are page/body CMS content and were not updated in this approved MediaAsset-only scope.
