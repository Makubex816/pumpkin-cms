# Mutation Surface Scan Result

Status: passed for the V2.11 import-intake surface.

API scan:

- `apps/pumpkin-api/Services/ImportIntake/ImportIntakeReadOnlyEndpoints.cs` contains eight `MapGet` registrations.
- No `MapPost`, `MapPut`, `MapPatch`, or `MapDelete` registrations exist under `apps/pumpkin-api/Services/ImportIntake`.
- The staged `apps/pumpkin-api/Program.cs` diff only adds `app.MapImportIntakeReadOnlyEndpoints();` for this phase lineage.

Admin scan:

- No mutation client methods were found under `apps/admin/src/lib/import-intake`, `apps/admin/src/components/import-intake`, or `apps/admin/src/app/dashboard/import-intake`.
- Text matches for `POST` are closed-state labels only, such as contact POST being closed.

Important boundary note:

- A pre-existing broader API route `app.MapPost("/api/admin/{tenantId}/import-runs", ...)` exists outside `Services/ImportIntake` and outside the new `/api/admin/import-intake` surface. V2.11.5 did not add, modify, invoke, or approve that route.

