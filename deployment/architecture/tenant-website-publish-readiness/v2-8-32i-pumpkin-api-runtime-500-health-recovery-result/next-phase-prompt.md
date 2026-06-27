# Next Phase Prompt

Approve V2.8.32J only:

Deploy the locally validated V2.8.32I null-safe JWT health fix to the existing Central US Pumpkin API Web App, then verify live health.

Selected target:

- Subscription: `ff887def-fd83-4a19-9298-13d4b1687873`
- Resource group: `rg-pumpkin-api-prod-centralus`
- Web App: `app-pumpkin-api-prod-centralus-001`
- Base URL: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`

Approved:

- Verify subscription and selected Web App.
- Build/publish/repack the current source with no appsettings/local/env entries.
- Deploy exactly once to the selected Web App.
- GET exactly:
  - `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health`
  - `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health`
- If both pass, record the Central US URL as canonical future `PUMPKIN_API_URL`.

Hard stops:

- No contact POST.
- No production API write.
- No FormEntry write/read.
- No Admin live API read.
- No provider/contact secret binding.
- No Azure app settings list/show.
- No secret app setting set.
- No protected config read.
- No `.env.local`, `appsettings`, or `local.settings` file read.
- No Key Vault.
- No keys/listKeys.
- No connection strings or SAS.
- No DNS/custom-domain mutation.
- No Search Console/indexing.
- No deployment token reset/list/print/export/use.
- No arbitrary outbound checks beyond the selected health URLs.

Recommended artifact source if not rebuilding:

`.tmp/v2-8-32i/pumpkin-api-health-recovery-local-fixed-posix.zip`
