# Next Phase Prompt

Use this exact prompt for the recommended first implementation step.

```text
V2.8.32C Pumpkin API Health Endpoint And Deployment Artifact Packet Implementation

Read and carry forward:
- PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32B_PUMPKIN_API_LIVE_RUNTIME_TARGET_PLANNING_REPORT.md
- deployment/architecture/tenant-website-publish-readiness/v2-8-32b-pumpkin-api-live-runtime-target-planning-result/

Goal:
Implement the local source and artifact readiness prerequisites for the planned Pumpkin API App Service deployment target without creating Azure resources or deploying. Add a non-secret GET /api/health endpoint, define or add the deploy artifact generation script/runbook if needed, run local build/syntax checks, and produce the next exact deployment approval prompt.

Allowed:
- Edit Pumpkin API source only as needed for GET /api/health.
- Add or update documentation/scripts for artifact generation only.
- Run dotnet restore/build/test or targeted local checks.
- Inspect repo-local docs/source.
- Run JSON parse, node --check for changed JS/MJS if any, git diff --check, secret-like scan, deploy/mutation scan, protected-path guard.

Forbidden:
- No Azure resource creation.
- No Azure mutation.
- No deployment or redeployment.
- No Azure app settings list/show/set.
- No protected config reads, including .env.local, appsettings*.json, local.settings*.json, Key Vault secrets, account keys, connection strings, SAS values, deployment tokens, or publish profile contents.
- No contact POST.
- No production API calls or writes.
- No DNS/custom-domain mutation.
- No Search Console/indexing.
- No inbox/provider login.
- No broad all-file staging command.

Required outputs:
- V2.8.32C root report.
- V2.8.32C result package.
- Source health endpoint implementation summary.
- Artifact generation plan/result.
- Local validation results.
- Exact deployment approval prompt for creating rg-pumpkin-api-prod-eastus, asp-pumpkin-api-prod-eastus-001, and app-pumpkin-api-prod-eastus-001 only after V2.8.32C passes.
```
