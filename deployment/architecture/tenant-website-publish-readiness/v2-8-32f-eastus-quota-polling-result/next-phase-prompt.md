# Next Phase Prompt

```text
Approve V2.8.32F-R East US quota status follow-up only: use the completed V2.8.32F quota polling result, the locked Azure subscription, and the operator-submitted quota ticket evidence to determine why the East US quota request ticket is not visible through the Azure Support CLI and whether quota approval has been approved, denied, or remains pending. Keep the Pumpkin API live deployment blocked unless quota approval is confirmed and a separate health-only retry approval is granted.

Required lock:
- Set active subscription to ff887def-fd83-4a19-9298-13d4b1687873 before Azure metadata commands.
- Run az account show and stop if active subscription ID does not match ff887def-fd83-4a19-9298-13d4b1687873.
- Preserve Path A unless the operator explicitly approves a different route.

Approved for V2.8.32F-R:
- Review the V2.8.32D, V2.8.32E, and V2.8.32F result packages and root reports.
- Read public-safe quota polling env values.
- Read public-safe ticket summary evidence if provided.
- Run read-only support ticket show by known ticket name if available:
  PumpkinApiEastUSAppServiceQuotaIncrease-20260627120242
- Run read-only support ticket list with public-safe fields only if useful.
- Record whether the ticket is visible, pending, approved, denied, closed, or not found through CLI.
- Optionally record operator-provided public-safe portal status evidence if supplied.
- Keep health deployment retry blocked unless quota approval is confirmed.
- Create the next result package and root report.
- If quota approval is confirmed, create a separate V2.8.32G health-only deployment retry approval prompt.
- If quota approval is not confirmed, create another polling or support follow-up prompt.

Not approved for V2.8.32F-R:
- Azure resource creation.
- Azure resource update.
- Azure resource deletion.
- App Service plan create/retry.
- Web App create/retry.
- ZIP deploy.
- SWA deploy.
- App settings list/show/set.
- Protected config read.
- Key Vault secret query.
- keys/listKeys.
- Connection string generation.
- SAS generation.
- Contact form POST.
- Production API write.
- DNS/custom-domain mutation.
- Search Console/indexing.
- Deployment token reset/list/print/export/use.
- Inbox/provider login.
- Arbitrary outbound URL checks.
- git add -A.

Only after quota approval is confirmed, request this separate approval before any deployment work:

Approve V2.8.32G Pumpkin API health-only App Service deployment retry only: use the completed V2.8.32D blocker evidence and V2.8.32E/F quota approval evidence to resume the planned health-only deployment on subscription ff887def-fd83-4a19-9298-13d4b1687873, region East US, resource group rg-pumpkin-api-prod-eastus, plan asp-pumpkin-api-prod-eastus-001, and web app app-pumpkin-api-prod-eastus-001. Reverify the Pumpkin API artifact, create or confirm only the planned App Service plan and Web App, deploy the ZIP artifact exactly once, request only /health and /api/health, and stop before protected provider binding, contact POST, production writes, DNS, indexing, or app-setting secret work.
```
