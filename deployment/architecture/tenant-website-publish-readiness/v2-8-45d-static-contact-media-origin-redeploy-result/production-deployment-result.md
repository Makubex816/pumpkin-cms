# Production Deployment Result

Target:

- Static Web App: `swa-ice-static-staging`
- Resource group: `rg-ice-static-staging`
- Default host: `https://happy-mud-0b375e20f.7.azurestaticapps.net`
- Apex host: `https://iceskatingrinkrentals.com`
- WWW host: `https://www.iceskatingrinkrentals.com`

Deployment:

- Tool: Azure Static Web Apps CLI 2.0.9.
- App location: package `app`.
- API location: package `api`.
- Environment: production.
- Result: success.
- Approved deploy attempts used: 1 of 1.

Production deploy happened only after isolated `/api/static-contact-health` returned HTTP 200.
