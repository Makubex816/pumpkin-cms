# Current State Summary

## Phase status

V2.8.32A is a read-only preflight and is complete. The current recommendation is NO-GO for production contact persistence binding.

## What is ready

- Public Ice production Static Web App exists: `swa-ice-static-staging`.
- Public Ice custom domains are Ready on that SWA: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`.
- Isolated Static Web App exists: `swa-ice-static-isolated-staging`.
- Legacy/static contact Function App exists and is Running: `func-ice-static-contact-20260605`.
- Production Cosmos account and database exist: `cosmos-pumpkin-prod-eastus` / `pumpkin-prod-cms`.
- Production Cosmos includes the `forms` container needed for `FormEntry` persistence.
- V2.8.31 local static contact adapter supports explicit Pumpkin API forwarding mode.

## What is not ready

- No live Pumpkin API Web App/App Service host is visible from current Azure metadata.
- The candidate publish-profile host `pumpkin-api-cdg2d3dwfpbbdygn.centralus-01.azurewebsites.net` is repo-local evidence only and was not verified as live.
- Admin live runtime is not verified as bound to a live Pumpkin API base URL.
- Static contact managed API is not verified as bound to Pumpkin API mode in Azure.
- Protected binding values were not read and must remain gated.

## Operating conclusion

The blocker is no longer local contact adapter implementation. The blocker is live Pumpkin runtime wiring: API host, provider binding, Admin base URL, static contact base URL, API key binding, tenant CORS/origin readiness, and runtime QA.
