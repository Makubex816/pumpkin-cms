# Subscription Visibility Result

| name | id | state | isDefault | tenantId | userName |
| --- | --- | --- | --- | --- | --- |
| Azure subscription 1 | ff887def-fd83-4a19-9298-13d4b1687873 | Enabled | true | 38b16667-a82c-4ff8-98d8-aeebbec4536a | Contact@iceskatingrinkrentals.com |

Azure UI guidance: select subscription `Azure subscription 1`, then search across split resource groups. Cosmos is not under the API resource group; it is in `rg-ice-production-cosmos`. Media Blob Storage is in `rg-ice-production-media`. The production Static Web App name includes `staging`, which can be visually confusing but is currently production-bound.
