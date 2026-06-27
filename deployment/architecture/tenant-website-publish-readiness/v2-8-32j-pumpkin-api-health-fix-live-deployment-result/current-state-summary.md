# Current State Summary

Status: live Pumpkin API health passed.

Selected target:

- Subscription: `ff887def-fd83-4a19-9298-13d4b1687873`
- Resource group: `rg-pumpkin-api-prod-centralus`
- Plan: `asp-pumpkin-api-prod-centralus-001`
- Web App: `app-pumpkin-api-prod-centralus-001`
- Base URL: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`

V2.8.32J deployed the V2.8.32I locally validated fixed artifact exactly once. Both live health routes now return HTTP `200`.

The Central US base URL is promoted as canonical future `PUMPKIN_API_URL`.
