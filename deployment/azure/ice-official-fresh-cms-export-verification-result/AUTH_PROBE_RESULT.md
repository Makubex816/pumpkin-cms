# Auth Probe Result

Generated: 2026-06-06

## Environment Presence

Only presence was checked:

| Env var | Status |
| --- | --- |
| `PUMPKIN_API_URL` | PRESENT |
| `ICE_RINK_RENTALS_API_KEY` | PRESENT |
| `ICE_RINK_RENTALS_TENANT_ID` | PRESENT |
| `PUMPKIN_ADMIN_JWT` | PRESENT |

Values were not printed.

## Probe

Read-only admin auth checks:

| Probe | Result |
| --- | --- |
| `GET /api/auth/verify` | `200` |
| `GET /api/admin/pages?tenantId=...` | `200` |
| admin page count returned | `9` |
| admin page slugs returned | `contact`, `events-holiday-activations`, `home`, `ice-rink-rentals`, `phase-3-draft-test-51412237`, `phase-3-duplicate-test-51412237`, `phase-5a-csv-import-54754949`, `phase-6d-redirect-test`, `service-areas` |
| `GET /api/admin/themes/{tenantId}/active` | `200` |

## Conclusion

The prior admin auth `401` blocker is resolved for this shell context. The official CMS-backed export was allowed to proceed.

No token, API key, credential, connection string, or protected config value was printed.
