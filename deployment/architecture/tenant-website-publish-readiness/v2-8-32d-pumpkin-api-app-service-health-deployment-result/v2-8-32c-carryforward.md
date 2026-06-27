# V2.8.32C Carryforward

V2.8.32C completed local Pumpkin API readiness without deploy or Azure mutation.

Carryforward facts:

- `GET /api/health` and `GET /health` were implemented as dependency-light health routes.
- FormEntry write route shape was verified as `POST /api/forms/{tenantId}/entries`.
- Admin read route shape was verified as `GET /api/admin/{tenantId}/form-entries`.
- Release build passed.
- Scoped V2.8.32C tests passed.
- Local publish passed with `ExcludeAppSettingsFromPublish=true`.
- Artifact path: `.tmp/v2-8-32c/pumpkin-api.zip`.
- Manifest file count: `56`.
- Artifact SHA-256: `05e9567dd47f7b59288569ea66815dc5059df903481f097e3222f0036ee5b854`.
- Blocked config file count: `0`.

V2.8.32C did not deploy, send POST requests, create Azure resources, mutate app settings, read protected config, or stage files.

