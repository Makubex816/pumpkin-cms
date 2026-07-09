# Admin UI FormEntry Readback Proof

## Source Support

Admin UI source includes tenant-scoped FormEntry readback:

| Surface | Source |
| --- | --- |
| API client list | `apps/admin/src/lib/api.ts:533` |
| API client detail | `apps/admin/src/lib/api.ts:547` |
| API client status update | `apps/admin/src/lib/api.ts:560` |
| Forms inbox page | `apps/admin/src/app/dashboard/forms/page.tsx:48` |
| Empty-state confirms FormEntry inbox | `apps/admin/src/app/dashboard/forms/page.tsx:199` |
| Detail page | `apps/admin/src/app/dashboard/forms/[id]/page.tsx:15` |
| Detail load | `apps/admin/src/app/dashboard/forms/[id]/page.tsx:50` |

## Runtime Availability

GET-only checks on 2026-07-09:

| URL | Status |
| --- | ---: |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/` | 200 |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login` | 200 |
| `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard` | 200 |

## Auth Boundary

Unauthenticated Admin API FormEntry routes returned `401`, as expected.

## Result

Admin UI source readback support is present. Live authenticated UI readback remains pending approved login/readback auth; no auth values were read or printed.
