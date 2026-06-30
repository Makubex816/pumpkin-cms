# Next Phase Prompt

Continue with V2.8.45C only.

Use the completed V2.8.45B result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-45b-static-contact-health-repair-result/`

Carry forward:

- V2.8.45B remained GET-only for runtime proof.
- No contact POST, content write, DNS/indexing, Pumpkin API deploy, Admin UI deploy, storage rollback, Key Vault read, storage key/listKeys, SAS generation, or connection string generation occurred.
- Static-contact source/tests passed.
- Production and isolated static-contact SWA appsettings now match the approved secure-file expected values by redacted exact comparison.
- Isolated-only SWA diagnostic rollback probe was non-causal; the diagnostic setting was restored.
- Production diagnostics were not rolled back.
- Final GET-only proof still shows `/api/static-contact-health` HTTP 500 with `Backend call failure` on production apex, production www, production default host, and isolated.
- GET-only backend-shape checks show all tested `/api/*` routes return the same SWA `Backend call failure`, including a deliberately missing route.
- Public pages, Pumpkin API health, and production Admin UI returned HTTP 200.

Approve only an isolated-first SWA package redeploy repair for the static-contact managed API backend, using an approved secure deployment token or approved deployment credential supplied in a new ignored secure file. Do not print the token. Do not query/list deployment tokens from Azure unless explicitly approved. Deploy isolated exactly once, prove isolated `/api/static-contact-health` HTTP 200, then deploy production exactly once and prove production apex/www/default `/api/static-contact-health` HTTP 200. Do not send contact POSTs unless separately approved after health is repaired.

