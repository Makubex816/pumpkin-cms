# Endpoint Contract Alignment

Implemented from the V2.8.48 developer endpoint contract:

- `GET /api/forms/{tenantId}/definitions/{type}`: `apps/pumpkin-api/Program.cs:325`
- `GET /api/admin/forms/{tenantId}/definitions`: `apps/pumpkin-api/Program.cs:1654`
- `GET /api/admin/forms/{tenantId}/definitions/{formDefinitionId}`: `apps/pumpkin-api/Program.cs:1678`
- `POST /api/admin/forms/{tenantId}/definitions`: `apps/pumpkin-api/Program.cs:1702`
- `PUT /api/admin/forms/{tenantId}/definitions/{formDefinitionId}`: `apps/pumpkin-api/Program.cs:1730`
- `DELETE /api/admin/forms/{tenantId}/definitions/{formDefinitionId}`: `apps/pumpkin-api/Program.cs:1758`

Deferred:

- `POST /api/forms/{tenantId}/submit/{type}` was not implemented in this phase because non-contact submission was optional and safe cleanup of FormEntry records is not source-supported by a delete route.
