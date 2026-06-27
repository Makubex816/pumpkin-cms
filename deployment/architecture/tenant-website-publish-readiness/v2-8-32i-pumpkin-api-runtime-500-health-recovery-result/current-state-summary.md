# Current State Summary

Status: live health still blocked; exact root cause fixed locally.

Selected target:

- Subscription: `ff887def-fd83-4a19-9298-13d4b1687873`
- Resource group: `rg-pumpkin-api-prod-centralus`
- Plan: `asp-pumpkin-api-prod-centralus-001`
- Web App: `app-pumpkin-api-prod-centralus-001`
- Base URL: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`
- Runtime metadata: `DOTNETCORE|10.0`

V2.8.32I used one live deployment attempt. The deployment succeeded, but live `/health` and `/api/health` remained HTTP `500`.

The exact root cause was then reproduced locally without appsettings/local/env files and fixed in source. A local-only fixed artifact returned HTTP `200` for both health routes, but it was not deployed because a second live deployment was outside the V2.8.32I deployment budget.
