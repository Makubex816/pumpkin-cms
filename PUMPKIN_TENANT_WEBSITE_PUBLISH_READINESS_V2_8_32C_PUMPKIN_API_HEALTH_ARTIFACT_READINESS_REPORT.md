# Pumpkin Tenant Website Publish Readiness V2.8.32C Pumpkin API Health Artifact Readiness Report

Date: 2026-06-27

Lane: V2.8 Tenant Website / Post-Release Contact Verification + Pumpkin Live Runtime Wiring

Classification: `pumpkin_api_health_artifact_readiness_no_deploy_no_mutation`

Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-32c-pumpkin-api-health-artifact-readiness-result/`

## Phase Status

V2.8.32C is complete locally. It added Pumpkin API health endpoints, verified the FormEntry write/read route shapes, built and tested the API locally, produced an ignored local publish artifact, and created the future App Service deployment plan and V2.8.32D prompt.

No deploy, Azure resource creation, Azure mutation, app-setting list/show/set, protected config read, contact POST, production API write, DNS mutation, Search Console/indexing, inbox/provider login, or arbitrary outbound URL check occurred.

## V2.8.32B Carryforward

V2.8.32B selected a new Linux Azure App Service target because no verified Pumpkin API Web App/App Service existed in active Azure metadata. Planned target:

| Field | Value |
| --- | --- |
| Resource group | `rg-pumpkin-api-prod-eastus` |
| App Service plan | `asp-pumpkin-api-prod-eastus-001` |
| Web App | `app-pumpkin-api-prod-eastus-001` |
| Region | `eastus` |
| Runtime | `.NET 10 / ASP.NET Core` |
| API base URL | `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net` |

## Operator Readiness Env Summary

Approved non-secret readiness env values were read. They matched the planned target above and set:

- `PUMPKIN_API_SOURCE_IMPLEMENTATION_APPROVED=true`
- `PUMPKIN_API_AZURE_MUTATION_APPROVED=false`
- `PUMPKIN_API_DEPLOY_APPROVED=false`
- `PUMPKIN_API_PROTECTED_CONFIG_APPROVED=false`
- `PUMPKIN_API_CONTACT_POST_APPROVED=false`

## Pumpkin API Source Readiness

Pumpkin API remains an ASP.NET Core Web SDK project targeting `net10.0`. `.tmp/` is now ignored for generated local artifacts. The project has an opt-in `ExcludeAppSettingsFromPublish` property to keep appsettings files out of readiness/deployment artifacts when explicitly requested.

The worktree was already busy. Pre-existing uncommitted changes in `apps/pumpkin-api/Program.cs` and `apps/pumpkin-api.Tests/Program.cs` were preserved.

## Health Endpoint Implementation Result

Added:

- `GET /api/health` as `GetApiHealth`
- `GET /health` as `GetRootHealth`

The handler returns `ok=true`, `service="pumpkin-api"`, version, environment label, `providerConfigured=false`, `providerStatus="not_checked"`, and `timestampUtc`. It does not inject database services or read provider config.

Source evidence:

- `apps/pumpkin-api/Program.cs:158`
- `apps/pumpkin-api/Program.cs:169`
- `apps/pumpkin-api/Program.cs:175`

## FormEntry Route Shape Verification

Verified source route:

- `POST /api/forms/{tenantId}/entries` at `apps/pumpkin-api/Program.cs:275`

The required `POST /api/forms/ice-rink-rentals/entries` path is satisfied by `tenantId=ice-rink-rentals`. No POST was sent.

## Admin FormEntry Read Route Verification

Verified source route:

- `GET /api/admin/{tenantId}/form-entries` at `apps/pumpkin-api/Program.cs:1218`

The required `GET /api/admin/ice-rink-rentals/form-entries` path is satisfied by `tenantId=ice-rink-rentals`. The route requires authorization and calls `GetFormEntriesByTenantAsync`. No live Admin read was performed.

## Local Build Validation Result

`dotnet build apps/pumpkin-api/pumpkin-api.csproj` was attempted first and hit a pre-existing running local Debug `pumpkin-api` process lock on `pumpkin-net-models.dll`. The process was not stopped.

`dotnet build apps/pumpkin-api/pumpkin-api.csproj -c Release` passed with 0 warnings and 0 errors.

## Local Test Validation Result

Command:

```powershell
dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -c Release -- --v2-8-32c
```

Result:

```text
V2.8.32C Pumpkin API health and route readiness checks passed.
```

## Local Publish Artifact Manifest

Command:

```powershell
dotnet publish apps/pumpkin-api/pumpkin-api.csproj -c Release --no-restore -o .tmp/v2-8-32c/pumpkin-api-publish /p:ExcludeAppSettingsFromPublish=true
```

Artifact:

| Field | Value |
| --- | --- |
| Publish directory | `.tmp/v2-8-32c/pumpkin-api-publish` |
| Zip | `.tmp/v2-8-32c/pumpkin-api.zip` |
| Manifest | `.tmp/v2-8-32c/publish-manifest.json` |
| File count | `56` |
| Aggregate SHA-256 | `22c6c0132bbee0cea8489ddf4c9553c06812b5a328dc6d3f69fc802e22201783` |
| Zip SHA-256 | `05e9567dd47f7b59288569ea66815dc5059df903481f097e3222f0036ee5b854` |
| Blocked config file count | `0` |

## Future App Service Deployment Command Plan

Future only. Not executed in V2.8.32C.

```powershell
az group create --name rg-pumpkin-api-prod-eastus --location eastus
az appservice plan create --name asp-pumpkin-api-prod-eastus-001 --resource-group rg-pumpkin-api-prod-eastus --location eastus --sku S1 --is-linux
az webapp create --name app-pumpkin-api-prod-eastus-001 --resource-group rg-pumpkin-api-prod-eastus --plan asp-pumpkin-api-prod-eastus-001 --runtime "DOTNETCORE:10.0"
az webapp deploy --resource-group rg-pumpkin-api-prod-eastus --name app-pumpkin-api-prod-eastus-001 --src-path .tmp/v2-8-32c/pumpkin-api.zip --type zip
```

V2.8.32D must verify runtime support before executing any creation/deployment command.

## Future App Setting Protected Binding Plan

Future only. No values were read or set. Setting names identified from source:

- `Database__Provider`
- `Database__CosmosDb__DatabaseName`
- `Database__CosmosDb__ConnectionString`
- `Database__CosmosDb__PreferredRegions`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__SecretKey`
- `ASPNETCORE_ENVIRONMENT`

Static contact/Admin binding names are documented in the result package without values.

## Runtime QA Smoke Test Plan

Future order: deployed API `GET /api/health`, `GET /health`, root probe, authenticated provider metadata, authenticated Admin FormEntry list, isolated static health/CORS, isolated no-PII write-read proof under separate approval, Backup Center/registry evidence, then separate production binding approval.

## Contact Gate Status

Open. V2.8.32C did not create a live API, bind provider settings, deploy, send a contact POST, or prove Admin readback of a persisted `FormEntry`.

## Boundary Confirmation

Confirmed:

- No deploy.
- No POST.
- No Azure creation or mutation.
- No app-setting list/show/set.
- No protected config read.
- No appsettings/local.settings content read.
- No `.env.local` read or touched.
- No files staged.

## Files Created Or Modified

Created:

- `apps/pumpkin-api.Tests/PumpkinApiHealthArtifactReadinessTestRunner.cs`
- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32C_PUMPKIN_API_HEALTH_ARTIFACT_READINESS_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32c-pumpkin-api-health-artifact-readiness-result/`
- `.tmp/v2-8-32c/` generated ignored artifact evidence

Modified:

- `.gitignore`
- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/pumpkin-api.csproj`
- `apps/pumpkin-api.Tests/Program.cs`

## Validation

See `deployment/architecture/tenant-website-publish-readiness/v2-8-32c-pumpkin-api-health-artifact-readiness-result/validation-summary.md`.

## Next Approval

The exact V2.8.32D approval prompt is in:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32c-pumpkin-api-health-artifact-readiness-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add -- ".gitignore" "apps/pumpkin-api/Program.cs" "apps/pumpkin-api/pumpkin-api.csproj" "apps/pumpkin-api.Tests/Program.cs" "apps/pumpkin-api.Tests/PumpkinApiHealthArtifactReadinessTestRunner.cs" "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32C_PUMPKIN_API_HEALTH_ARTIFACT_READINESS_REPORT.md" "deployment/architecture/tenant-website-publish-readiness/v2-8-32c-pumpkin-api-health-artifact-readiness-result"
git commit -m "Record V2.8.32C Pumpkin API health artifact readiness"
```
