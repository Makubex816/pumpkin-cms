# API Endpoint Implementation Summary

Implemented code paths:

- `apps/pumpkin-api/Services/AuditJobs/AuditJobReadOnlyEndpoints.cs`
- `apps/pumpkin-api/Program.cs`

The endpoint mapper registers one route group:

`/api/admin/audit-jobs`

The group uses `.RequireAuthorization()` and registers only `MapGet` routes.

No Audit Jobs write route mapper was added.

