# Tenant Form Surface Inventory

## Source Endpoints

Pumpkin API source-discovered routes:

| Surface | Source |
| --- | --- |
| Tenant FormEntry submit | `apps/pumpkin-api/Program.cs:411` maps `POST /api/forms/{tenantId}/entries` |
| Tenant submit alias | `apps/pumpkin-api/Program.cs:432` maps `POST /api/forms/{tenantId}/submit/{type}` |
| Admin FormEntry list | `apps/pumpkin-api/Program.cs:1831` maps `GET /api/admin/{tenantId}/form-entries` |
| Admin FormEntry detail | `apps/pumpkin-api/Program.cs:1863` maps `GET /api/admin/{tenantId}/form-entries/{id}` |
| Admin forms alias list | `apps/pumpkin-api/Program.cs:1895` maps `GET /api/admin/forms/{tenantId}/entries` |
| Admin FormDefinition list | `apps/pumpkin-api/Program.cs:2025` maps `GET /api/admin/forms/{tenantId}/definitions` |

Source implementation anchors:

| Surface | Source |
| --- | --- |
| Submit manager | `apps/pumpkin-api/Managers/PumpkinManager.cs:178` and `apps/pumpkin-api/Managers/PumpkinManager.cs:223` |
| Cosmos save | `apps/pumpkin-api/Services/CosmosDataConnection.cs:422` |
| Cosmos tenant readback | `apps/pumpkin-api/Services/CosmosDataConnection.cs:479` and `apps/pumpkin-api/Services/CosmosDataConnection.cs:511` |
| Starter submit adapter | `apps/starter-app/src/app/api/forms/submit/[type]/route.ts:22` forwards to Pumpkin API submit alias |
| Starter submit auth header | `apps/starter-app/src/app/api/forms/submit/[type]/route.ts:27` sets a bearer API key without exposing it |
| Admin UI client | `apps/admin/src/lib/api.ts:533` reads tenant FormEntries |
| Admin UI inbox | `apps/admin/src/app/dashboard/forms/page.tsx:48` loads tenant entries |
| Admin UI detail | `apps/admin/src/app/dashboard/forms/[id]/page.tsx:50` loads a tenant entry |

## Tenant Inventory

| Tenant | Public/live route | FormDefinition state | Required fields | Consent | Honeypot | Hidden fields | Submit endpoint | FormEntry readback | Admin UI visibility | Email behavior |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ice-rink-rentals` | `/contact` on apex and www returned HTTP 200; public HTML renders a form with no HTML `action` or `method=post` | Source default quote definition exists in `packages/pumpkin-ts-models/src/forms.ts:274`; live Admin readback requires JWT and returned `401` without it | Default quote requires `fullName`, `email`, `phone`, `eventCity`, `eventState`, `eventDateOrDateRange`, `eventType`, `venueSetting`, `message`, `consent` per `apps/pumpkin-api/Services/FormSubmissionGuard.cs:37` | Source required | Source default includes `honeypot`; public rendered contact HTML did not expose a honeypot marker in OL GET scan | Source default preserves tenant/site/form fields where provided | Pumpkin API submit alias exists; static contact endpoint exists but was not posted | Source supported; unauth live readback returned `401` | Source UI supported | Pumpkin API source path writes FormEntry only; legacy/static endpoint may email and was not posted |
| `party-pros-philadelphia` | Preview `/preview/party-pros-philadelphia/contact` returned HTTP 200; no publish | Backup live FormDefinition is active for `party-pros-quote-request` | `package`, `date`, `time`, `guests`, `name`, `phone` | Required, field `consent` | `company_website` | `tenant-id` | Pumpkin API submit alias exists; starter preview remains no-post | Source supported; unauth live readback returned `401` | Source UI supported | FormDefinition has notification/recipient refs, values not printed; no live POST without safe recipient/suppression |
| `airstrip-club-las-vegas` | Public runtime not probed in OL; Airstrip frozen | Backup FormDefinition active for `airstrip-reservation` | `package`, `date`, `time`, `guests`, `name`, `phone`, `consent` | Required, field `consent` | `honeypot` | `tenantid`, `sitekey`, `formkey`, `sourcepage` | Source path exists | Source supported; unauth definition readback returned `401` | Source UI supported | Notification refs exist in backup, values not printed; no Airstrip live POST approved |

## Classification

The universal form pipeline is source-supported. Authenticated live creation/readback is pending an approved auth and email-safety handoff.
