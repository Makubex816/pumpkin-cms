# Pumpkin API Submission Read-Path Analysis

Source inspected:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Managers/PumpkinManager.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/MongoDataConnection.cs`
- `apps/pumpkin-api/Services/FormSubmissionGuard.cs`
- `apps/pumpkin-net-models/Models/FormEntry.cs`

Write path:

- Public save endpoint: `POST /api/forms/{tenantId}/entries`: `apps/pumpkin-api/Program.cs:251-270`.
- Save handler validates API key, tenant ID, payload, and form guard before saving: `apps/pumpkin-api/Managers/PumpkinManager.cs:178-207`.
- Cosmos write target: `FormEntry` container with partition key `tenantId`: `apps/pumpkin-api/Services/CosmosDataConnection.cs:422-460`.
- Mongo write target, when compiled/enabled: `FormEntry` collection filtered by `TenantId`: `apps/pumpkin-api/Services/MongoDataConnection.cs:281-332`.

Read path:

- Admin list endpoint: `GET /api/admin/{tenantId}/form-entries`: `apps/pumpkin-api/Program.cs:1194-1224`.
- Cosmos read query: `SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.submittedAt DESC`: `apps/pumpkin-api/Services/CosmosDataConnection.cs:479-502`.
- Mongo read filter: `TenantId == tenantId`, sorted by `SubmittedAt`: `apps/pumpkin-api/Services/MongoDataConnection.cs:346-354`.

Submission guard:

- Supports `default-contact` and `default-quote-request`: `apps/pumpkin-api/Services/FormSubmissionGuard.cs:22-38`.
- Normalizes `ice-contact-quote-request` to `default-quote-request`: `apps/pumpkin-api/Services/FormSubmissionGuard.cs:129-136`.

Conclusion:

Pumpkin API persistence and Admin visibility are connected to the same `FormEntry` read/write model. The missing Admin entry means the static compat function either did not write to this API/store, wrote to a different backend/provider, or the operator's Admin session was reading a different environment/provider than the production static function would have written to.

