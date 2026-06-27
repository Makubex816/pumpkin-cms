# Next Phase Prompt

```text
Approve V2.8.32F Pumpkin API East US quota approval polling only: use the completed V2.8.32E quota request submission closeout, the locked Azure subscription, and the public-safe operator quota-ticket evidence to determine whether the East US quota increase from 0 to 1 has been approved. Keep the Pumpkin API live deployment blocked unless quota approval is confirmed and a separate V2.8.32D retry approval is granted.

Required lock:
- Set active subscription to ff887def-fd83-4a19-9298-13d4b1687873 before any Azure metadata command.
- Run az account show and stop if active subscription ID does not match ff887def-fd83-4a19-9298-13d4b1687873.
- Every future Pumpkin API resource must remain under /subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/.

Approved for V2.8.32F:
- Review the V2.8.32E root report and result package.
- Read public-safe quota-ticket env values.
- Read the public-safe quota-ticket summary file if present.
- Query the known support ticket by name if available:
  PumpkinApiEastUSAppServiceQuotaIncrease-20260627120242
- Record whether quota approval is approved, denied, still pending, or not confirmable.
- Keep Path A selected unless the operator explicitly approves a different route.
- Create the next result package and root report.
- If quota approval is confirmed, create a separate V2.8.32D retry prompt.
- If quota approval is not confirmed, keep deployment retry blocked.

Not approved for V2.8.32F:
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

After quota approval is confirmed, request this separate approval before any deployment work:

Approve V2.8.32D-R Pumpkin API App Service quota-unblock retry only: use the completed V2.8.32D blocker evidence and V2.8.32E/F quota approval evidence to resume the planned health-only deployment on subscription ff887def-fd83-4a19-9298-13d4b1687873, region East US, resource group rg-pumpkin-api-prod-eastus, plan asp-pumpkin-api-prod-eastus-001, and web app app-pumpkin-api-prod-eastus-001. Reverify the Pumpkin API artifact, create or confirm only the planned App Service plan and Web App, deploy the ZIP artifact exactly once, request only /health and /api/health, and stop before protected provider binding, contact POST, production writes, DNS, indexing, or app-setting secret work.
```
