# Env Presence Result

Date: 2026-06-09

The required Phase 2F-8 presence-only env gate was run in the Codex terminal process before execution. Only presence status was printed or recorded.

| Variable | Presence | Use |
| --- | --- | --- |
| `PUMPKIN_API_URL` | PRESENT | Required for CMS API target selection |
| `PUMPKIN_ADMIN_JWT` | PRESENT | Required for read-only CMS admin export |
| `ICE_RINK_RENTALS_API_KEY` | MISSING | Not required by the selected read-only admin export path |
| `ICE_RINK_RENTALS_TENANT_ID` | MISSING | Defaulted to approved tenant key `ice-rink-rentals` |

No env var values, JWTs, API keys, auth headers, cookies, storage keys, or connection strings were printed or written.

Additional database/media Azure variables were intentionally excluded from this phase because Azure actions, protected config reads, and real database/media export actions were not approved.

