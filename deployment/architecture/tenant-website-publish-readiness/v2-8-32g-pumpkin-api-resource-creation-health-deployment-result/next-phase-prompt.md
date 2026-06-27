# Next Phase Prompt

```text
Approve V2.8.32H East US App Service quota approval confirmation only: use the completed V2.8.32G result showing the single approved Linux B1 App Service plan creation attempt failed because East US Total VMs quota remains 0, and determine whether quota has now been raised to at least 1 for subscription ff887def-fd83-4a19-9298-13d4b1687873. Keep Path A selected and keep Pumpkin API deployment blocked unless quota approval is confirmed. Do not retry resource creation in this phase.

Required lock:
- Set active subscription to ff887def-fd83-4a19-9298-13d4b1687873 before Azure metadata commands.
- Run az account show and stop if active subscription ID does not match ff887def-fd83-4a19-9298-13d4b1687873.

Approved for V2.8.32H:
- Review V2.8.32C through V2.8.32G result packages and root reports.
- Read public-safe quota/ticket env values if provided.
- Run read-only support ticket show/list commands with public-safe fields if useful.
- Run read-only quota/status checks only if they do not create, update, delete, deploy, list app settings, read protected config, query secrets, generate connection strings, generate SAS, mutate DNS, or run indexing.
- Record whether East US Total VMs quota is approved to at least 1, still 0, denied, or not confirmable.
- If quota remains 0 or not confirmable, create the next support/portal follow-up prompt and keep deployment blocked.
- If quota is confirmed at least 1, create a separate V2.8.32G-R bounded health deployment retry approval prompt.

Not approved for V2.8.32H:
- Azure resource creation.
- Azure resource update.
- Azure resource deletion.
- App Service plan create/retry.
- Web App create/retry.
- ZIP deploy.
- Health GET checks.
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

Only after quota is confirmed at least 1, request this separate approval before resource creation or deployment:

Approve V2.8.32G-R Pumpkin API App Service resource creation retry and health-only deployment only: use the completed V2.8.32G blocker evidence and confirmed East US quota approval to retry the locked Path A target under subscription ff887def-fd83-4a19-9298-13d4b1687873. Confirm or create only resource group rg-pumpkin-api-prod-eastus, Linux B1 App Service plan asp-pumpkin-api-prod-eastus-001, and Web App app-pumpkin-api-prod-eastus-001. Reverify artifact .tmp/v2-8-32c/pumpkin-api.zip with SHA-256 05e9567dd47f7b59288569ea66815dc5059df903481f097e3222f0036ee5b854, deploy the ZIP exactly once if the Web App exists, GET only https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/health and https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/api/health after deployment succeeds, and stop before contact POST, app settings, protected config, provider binding, FormEntry validation, DNS, indexing, tokens, keys/listKeys, connection strings, or SAS.
```
