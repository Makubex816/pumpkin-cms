# Next Phase Prompt

```text
Approve V2.8.32D-R Pumpkin API App Service quota-unblock resume only: use the completed V2.8.32D evidence showing resource group creation and App Service plan quota blocker to continue the planned health-only deployment after Azure East US Total VMs quota is raised to at least 1, or after the operator provides an explicitly approved alternate target.

Approved:
- Review the V2.8.32D result package and root report.
- Confirm `rg-pumpkin-api-prod-eastus` exists.
- Confirm Azure Linux runtime `DOTNETCORE|10.0` is still available.
- Confirm `.tmp/v2-8-32c/pumpkin-api.zip` still exists and matches SHA-256 `05e9567dd47f7b59288569ea66815dc5059df903481f097e3222f0036ee5b854`, or rebuild an equivalent ignored artifact with protected config excluded.
- Create Linux App Service plan `asp-pumpkin-api-prod-eastus-001` only if missing.
- Create Web App `app-pumpkin-api-prod-eastus-001` only if missing.
- Configure only non-secret runtime settings required for the Web App to run the deployed artifact.
- Deploy the Pumpkin API ZIP artifact exactly once.
- Do not retry deployment if the sent deployment attempt fails.
- If deployment succeeds, GET exactly:
  `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/health`
  `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/api/health`
- Record HTTP status and public-safe response summaries.
- Create live Pumpkin API health verification evidence.
- Create the next protected provider-binding and FormEntry read/write validation prompt only after health succeeds.

Not approved:
- Contact form POST.
- Production contact POST.
- Isolated contact POST.
- FormEntry write test.
- Binding Ice static contact function to Pumpkin API.
- Setting `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`.
- Setting provider secrets.
- Reading protected config.
- `.env.local` read/print/copy/move/rename/parse/source/modify.
- Appsettings file read.
- Local.settings file read.
- Key Vault secret query.
- keys/listKeys.
- Connection string generation.
- SAS generation.
- DNS mutation.
- Custom-domain mutation.
- Search Console/indexing.
- Deployment token reset/list/print/export/use.
- Inbox/provider login.
- Arbitrary outbound URL checks.
- git add -A.
```

