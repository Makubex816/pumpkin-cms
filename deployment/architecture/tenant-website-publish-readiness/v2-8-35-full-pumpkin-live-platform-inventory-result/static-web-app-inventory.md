# Static Web App Inventory

## Production SWA

- Name: `swa-ice-static-staging`.
- Resource group: `rg-ice-static-staging`.
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`.
- Custom hostnames: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`.
- Hostname status: Ready.
- SKU: Free.
- Repository/branch binding: not set in Azure metadata.

Runtime GET results:

- `https://iceskatingrinkrentals.com/api/static-contact-health`: HTTP 200.
- `https://iceskatingrinkrentals.com/contact`: HTTP 200.
- `/contact` uses `/api/static-contact`: true.
- `/contact` uses `/api/contact`: false.
- `/contact` contains `contact@iceskatingrinkrentals.com`: true.

## Isolated SWA

- Name: `swa-ice-static-isolated-staging`.
- Resource group: `rg-ice-static-staging`.
- Default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`.
- Custom hostnames: none found.
- SKU: Free.
- Repository/branch binding: not set in Azure metadata.

Runtime GET results:

- `https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact-health`: HTTP 200.
- `https://kind-island-0a85a740f.7.azurestaticapps.net/contact`: HTTP 200.
- `/contact` uses `/api/static-contact`: true.
- `/contact` uses `/api/contact`: false.
- `/contact` contains `contact@iceskatingrinkrentals.com`: true.
