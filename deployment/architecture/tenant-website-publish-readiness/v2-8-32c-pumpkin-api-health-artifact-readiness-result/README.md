# V2.8.32C Pumpkin API Health Artifact Readiness Result

Date: 2026-06-27

Lane: V2.8 Tenant Website / Post-Release Contact Verification + Pumpkin Live Runtime Wiring

Classification: `pumpkin_api_health_artifact_readiness_no_deploy_no_mutation`

Status: complete locally. No Azure resources were created, no deployment occurred, no app settings were read or mutated, no protected config was read, and no POST was sent.

## Result

- Added dependency-light Pumpkin API health routes: `GET /api/health` and `GET /health`.
- Verified the existing FormEntry write route shape: `POST /api/forms/{tenantId}/entries`, satisfying `/api/forms/ice-rink-rentals/entries`.
- Verified the existing Admin FormEntry read route shape: `GET /api/admin/{tenantId}/form-entries`, satisfying `/api/admin/ice-rink-rentals/form-entries`.
- Added a scoped V2.8.32C test runner for source readiness checks.
- Created a local publish artifact under ignored `.tmp/v2-8-32c/`.
- Created a publish manifest with file count and SHA-256 summaries.

## Key Evidence

- Source health routes: `apps/pumpkin-api/Program.cs`
- Scoped test runner: `apps/pumpkin-api.Tests/PumpkinApiHealthArtifactReadinessTestRunner.cs`
- Local publish manifest: `.tmp/v2-8-32c/publish-manifest.json`
- Zip artifact: `.tmp/v2-8-32c/pumpkin-api.zip`

## Package Files

See `result-manifest.json` for the complete file list.
