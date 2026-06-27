# Next Phase Prompt

Approve V2.8.32I only:

Diagnose the deployed Central US Pumpkin API live health HTTP `500` after the V2.8.32H corrected deployment. Use the selected target only:

- Subscription: `ff887def-fd83-4a19-9298-13d4b1687873`
- Resource group: `rg-pumpkin-api-prod-centralus`
- Web App: `app-pumpkin-api-prod-centralus-001`
- Base URL: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`

Allowed:

- Confirm subscription and selected Web App.
- Inspect safe runtime/deployment metadata.
- Inspect App Service application logs or container startup logs if explicitly non-secret and redacted.
- Inspect local source code for startup/auth/health route behavior.
- If approved in the same prompt, implement a local code fix that keeps `/health` and `/api/health` dependency-light and unauthenticated.
- If a code fix is made, build/publish/repack and deploy exactly once.
- GET exactly `/health` and `/api/health` after deployment.

Hard stops unless separately approved:

- No contact POST.
- No production API write.
- No FormEntry read/write.
- No Admin live API read.
- No provider/contact secret binding.
- No Azure app settings list/show.
- No secret app settings set.
- No protected config read.
- No `.env.local`, `appsettings`, or `local.settings` file read.
- No Key Vault.
- No keys/listKeys.
- No connection strings or SAS.
- No DNS.
- No Search Console/indexing.
- No deployment token reset/list/print/export/use.
- No arbitrary outbound checks beyond the selected health URLs.

Required output:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32i-pumpkin-api-live-health-500-diagnosis-result/`
