# Current State Summary

V2.8.48 closed the standalone FormDefinition API design gap for tenant onboarding.

- Pumpkin API now exposes public API-key FormDefinition read by type or form key.
- Pumpkin API now exposes JWT-protected Admin FormDefinition list/read/create/update/delete routes.
- `FormDefinition` storage is tenant-scoped using `/tenantId`.
- One production FormDefinition lifecycle proof passed and was fully cleaned up.
- Admin UI Form Builder route is live in production and isolated environments, but standalone FormDefinition UI CRUD is not yet implemented in the Admin UI.
