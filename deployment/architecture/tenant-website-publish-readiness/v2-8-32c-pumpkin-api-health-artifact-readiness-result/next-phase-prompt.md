# Next Phase Prompt

Use this exact prompt for V2.8.32D.

```text
V2.8.32D Pumpkin API App Service Provisioning And Deployment Approval

Read and carry forward:
- PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32C_PUMPKIN_API_HEALTH_ARTIFACT_READINESS_REPORT.md
- deployment/architecture/tenant-website-publish-readiness/v2-8-32c-pumpkin-api-health-artifact-readiness-result/
- .tmp/v2-8-32c/publish-manifest.json

Goal:
Provision and deploy the planned Pumpkin API App Service target only after confirming the active Azure subscription, supported Linux App Service runtime, and exact resource names. Use the V2.8.32C local artifact `.tmp/v2-8-32c/pumpkin-api.zip` only if it is still present and its SHA-256 is `05e9567dd47f7b59288569ea66815dc5059df903481f097e3222f0036ee5b854`; otherwise rebuild locally with the same protected-config-free publish command before deployment.

Approved only if the operator explicitly approves V2.8.32D:
- Verify Azure account/subscription context without printing secrets.
- Verify whether Linux App Service supports the planned `.NET 10 / ASP.NET Core` runtime in the target subscription/region.
- If the runtime is supported, create resource group `rg-pumpkin-api-prod-eastus`.
- Create Linux App Service plan `asp-pumpkin-api-prod-eastus-001` in `eastus`.
- Create Web App `app-pumpkin-api-prod-eastus-001`.
- Bind required Pumpkin API app setting names through a protected/no-print flow only if protected binding is explicitly approved in the same prompt.
- Deploy `.tmp/v2-8-32c/pumpkin-api.zip` to the Web App only if deploy is explicitly approved in the same prompt.
- Run GET-only smoke checks for `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/api/health` and `/health` only after deploy approval.
- Record resource ids, runtime evidence, app setting names without values, deployment hash, health results, rollback instructions, and next gates.

Hard stops:
- Stop if `.NET 10 / ASP.NET Core` is not supported for the target App Service runtime and request a runtime decision.
- Do not print, list, export, or reset deployment tokens.
- Do not print protected app setting values.
- Do not read `.env.local`, appsettings files, local.settings files, Key Vault secrets, account keys, connection strings, or SAS values unless separately approved.
- Do not send contact POSTs.
- Do not mutate DNS/custom domains.
- Do not run Search Console/indexing.
- Do not access inbox/provider systems.
- Do not run arbitrary outbound URL checks beyond the approved deployed API health GETs.
- Do not use `git add -A`.

Required outputs:
- V2.8.32D root report.
- V2.8.32D result package.
- Runtime availability evidence.
- Created resource evidence or explicit stop reason.
- Deployment evidence if deploy approved and executed.
- GET-only health smoke result if deploy approved and executed.
- App setting name manifest without values.
- Rollback plan.
- Security boundary confirmation.
- Next prompt for protected provider/Admin/static contact binding and isolated write-read proof.
```
