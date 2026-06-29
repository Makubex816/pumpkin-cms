# Resource Registry Update Plan

Update the canonical resource registry with:

1. Production public site SWA:
   - `swa-ice-static-staging`
   - `rg-ice-static-staging`
   - hostnames `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com`

2. Isolated proof SWA:
   - `swa-ice-static-isolated-staging`
   - `kind-island-0a85a740f.7.azurestaticapps.net`

3. Production API:
   - `app-pumpkin-api-prod-centralus-001`
   - `asp-pumpkin-api-prod-centralus-001`
   - `rg-pumpkin-api-prod-centralus`

4. Production data:
   - `cosmos-pumpkin-prod-eastus`
   - `pumpkin-prod-cms`
   - all discovered containers and partition keys

5. Production media:
   - `iceskatingmedia`
   - `ice-rink-rentals-media`
   - public blob base and live prefix

6. Cleanup-review resources:
   - empty fallback groups
   - legacy static form Function App stack

7. Open registry risks:
   - Admin UI deployment target not yet created.
   - Cosmos source/container naming mismatch unresolved.
   - Production diagnostics and media restore settings incomplete.
