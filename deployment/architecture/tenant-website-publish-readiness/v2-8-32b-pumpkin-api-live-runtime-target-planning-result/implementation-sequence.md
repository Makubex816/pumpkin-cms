# Implementation Sequence

## Phase 1: Source hardening and artifact prep

1. Add `GET /api/health`.
2. Confirm no health response exposes protected values.
3. Run API build.
4. Run relevant API tests.
5. Produce a publish zip and artifact hash.

## Phase 2: API host deployment

1. Verify .NET 10 App Service runtime stack token.
2. Create `rg-pumpkin-api-prod-eastus`.
3. Create `asp-pumpkin-api-prod-eastus-001`.
4. Create `app-pumpkin-api-prod-eastus-001`.
5. Bind protected settings by name through secret-safe workflow.
6. Deploy the zip artifact.
7. Run approved health and provider metadata checks.

## Phase 3: Admin binding

1. Bind Admin `NEXT_PUBLIC_API_URL` to the verified API URL.
2. Run Admin type-check/build if source changed.
3. Run approved read-only form-entry list.

## Phase 4: Isolated static contact binding

1. Bind isolated static contact settings to Pumpkin API mode.
2. Run static contact health/OPTIONS checks.
3. Run one approved no-PII isolated POST.
4. Confirm returned id appears in Admin.

## Phase 5: Evidence and production readiness

1. Refresh Resource Registry and Provider Profile.
2. Refresh Backup Center proof.
3. Prepare production rollback manifest.
4. Request separate production binding approval.

## Phase 6: Production binding

1. Bind production static contact to Pumpkin API mode.
2. Run production health/OPTIONS checks.
3. Run at most one production no-PII POST only if separately approved.
4. Close contact gate only after Admin readback confirms the same id.
