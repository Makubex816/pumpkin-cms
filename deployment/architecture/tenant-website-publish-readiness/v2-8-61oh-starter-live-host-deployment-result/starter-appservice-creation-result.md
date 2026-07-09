# Starter App Service Creation Result

Creation result: passed.

Created App Service:

- Name: `app-pumpkin-starter-preview-centralus-001`
- Resource group: `rg-pumpkin-api-prod-centralus`
- Existing plan: `asp-pumpkin-api-prod-centralus-001`
- Runtime: `NODE|22-lts`
- Kind: `app,linux`
- Default host: `app-pumpkin-starter-preview-centralus-001.azurewebsites.net`
- State after creation: running

Azure rejected the first create call because `NODE|20-lts` was not supported by the current Linux runtime catalog. A follow-up read confirmed the target app still did not exist. The app was then created with `NODE|22-lts`, the conservative supported LTS runtime.

No new App Service plan, Cosmos account, Storage account, Static Web App, Key Vault, or database was created.
