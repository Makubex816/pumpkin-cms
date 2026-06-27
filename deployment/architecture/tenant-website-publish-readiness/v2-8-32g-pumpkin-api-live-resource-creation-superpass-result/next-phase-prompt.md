# Next Phase Prompt

```text
Approve V2.8.32G-D Pumpkin API selected Web App deployment diagnostics only: use the completed V2.8.32G Superpass result showing selected target app-pumpkin-api-prod-centralus-001 in rg-pumpkin-api-prod-centralus under subscription ff887def-fd83-4a19-9298-13d4b1687873, with resource creation complete but ZIP deployment failed server-side with HTTP 400. Diagnose the failed deployment using public-safe deployment status evidence and local artifact/package inspection, without app settings, protected config, secrets, keys, connection strings, SAS, DNS, indexing, contact POST, FormEntry validation, Admin live API read, deployment token reset/list/print/export/use, inbox/provider login, or arbitrary outbound URL checks.

Required lock:
- Set active subscription to ff887def-fd83-4a19-9298-13d4b1687873 before Azure metadata commands.
- Run az account show and stop if active subscription ID does not match ff887def-fd83-4a19-9298-13d4b1687873.

Approved for V2.8.32G-D:
- Review V2.8.32C through V2.8.32G Superpass result packages and root reports.
- Confirm selected resource group rg-pumpkin-api-prod-centralus exists.
- Confirm selected plan asp-pumpkin-api-prod-centralus-001 exists.
- Confirm selected Web App app-pumpkin-api-prod-centralus-001 exists.
- Review public-safe deployment status for the failed ZIP deployment.
- Inspect local ZIP package structure without reading protected config.
- Rebuild the ignored local artifact only if the package shape is diagnosed as invalid and rebuild can exclude protected config.
- Create a corrected deployment retry prompt only if the exact correction is known.
- If a corrected retry is approved later and deployment succeeds, GET only:
  https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health
  https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health

Not approved for V2.8.32G-D:
- ZIP deployment retry.
- Contact form POST.
- Production API write.
- FormEntry write/read validation.
- Admin live API read validation.
- Setting provider/contact secrets.
- Azure app settings list/show/set.
- Protected config read.
- .env.local read/print/copy/move/rename/parse/source/modify.
- Appsettings file read.
- Local.settings file read.
- Key Vault secret query.
- keys/listKeys.
- Connection string generation.
- SAS generation.
- DNS/custom-domain mutation.
- Search Console/indexing.
- Deployment token reset/list/print/export/use.
- Inbox/provider login.
- Arbitrary outbound URL checks.
- git add -A.
```
