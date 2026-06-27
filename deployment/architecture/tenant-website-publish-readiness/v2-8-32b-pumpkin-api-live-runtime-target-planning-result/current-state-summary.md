# Current State Summary

## Summary

V2.8.32B converts the V2.8.32A blocker into an implementation plan. The blocker is not local static contact code; it is the missing live Pumpkin API runtime target.

## Current live resource state

| Area | Current state |
| --- | --- |
| Production Ice SWA | `swa-ice-static-staging`, custom domains Ready |
| Isolated Ice SWA | `swa-ice-static-isolated-staging`, no custom hostnames |
| Static contact Function App | `func-ice-static-contact-20260605`, Running |
| Pumpkin API Web App | None visible; `az webapp list` returned `[]` |
| App Service plan | Only current plan is `EastUSPlan` Y1 for Function App |
| Container Apps | `Microsoft.App` provider is `NotRegistered` |
| Production Cosmos | `cosmos-pumpkin-prod-eastus`, database `pumpkin-prod-cms`, `forms` container present |

## Current source state

- Pumpkin API source exists as an ASP.NET Core Web SDK project targeting `net10.0`.
- Contact write route exists: `POST /api/forms/{tenantId}/entries`.
- Admin form-entry read routes exist.
- Provider metadata endpoint exists, but is authenticated and currently reports runtime wiring required.
- Dedicated health endpoint does not exist in source; add `GET /api/health` before deployment.
- Admin client uses `NEXT_PUBLIC_API_URL` with localhost fallback.
- Static contact compat package can forward to Pumpkin API in `pumpkin-api` mode with explicit `PUMPKIN_API_URL` and protected key-name binding.

## Planning conclusion

Create a new App Service target for Pumpkin API, bind it to production Cosmos through protected settings, prove read-only API/provider health, then bind Admin and isolated static contact before any production contact binding.
