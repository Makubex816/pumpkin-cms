# Production App Service Result

Result: passed.

Target:

- App Service: `app-airstrip-prod-centralus-001`.
- Resource group: `rg-pumpkin-api-prod-centralus`.
- Existing plan: `asp-pumpkin-api-prod-centralus-001`.
- Runtime: `NODE|22-lts`.
- Startup command: `node server.js`.

Start state:

- Production Airstrip App Service did not exist at phase start.

Action:

- Created one production Airstrip App Service on the approved existing Linux App Service plan.
- Configured required source-discovered runtime setting names.
- Configured secret setting value from the approved secure file without printing or writing it.
- No Ice App Service or Static Web App was mutated.
