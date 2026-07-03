# Isolated Preview App Result

Result: passed.

Target:

- App name: `app-airstrip-preview-isolated-centralus-001`
- Resource group: `rg-pumpkin-api-prod-centralus`
- App Service plan: `asp-pumpkin-api-prod-centralus-001`
- Host: `https://app-airstrip-preview-isolated-centralus-001.azurewebsites.net`

Start state:

- The app did not exist before V2.8.59.

Action:

- Created exactly one isolated preview App Service on the approved existing Linux plan.
- Configured non-secret appsettings only.
- Configured standalone startup command.
- Did not configure tenant API key as an appsetting.
- Did not configure custom domains.
- Did not mutate DNS.
