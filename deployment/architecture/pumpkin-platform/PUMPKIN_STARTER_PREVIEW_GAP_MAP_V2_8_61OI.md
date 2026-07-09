# Pumpkin Starter Preview Gap Map V2.8.61OI

Purpose: map the gap between the current shared starter host and a Party Pros read-only preview.

| Gap | Current Evidence | Required Repair |
| --- | --- | --- |
| Tenant binding missing | Name-only appsetting readback lacks `PUMPKIN_TENANT_ID` and `PUMPKIN_API_KEY` | Approve secure binding or a preview data source that avoids live binding |
| Runtime is published-only | `fetchPumpkinPage` calls `/api/pages/{tenantId}/{slug}` | Add unpublished read-only preview route or publish only with separate approval |
| Party Pros pages unpublished | OF/OE carryforward: all Party Pros pages unpublished | Preview must render unpublished pages without publishing them |
| Compiled package not renderable by starter | No route loads `compiled-package` files | Add compiled-package fixture adapter if that path is selected |
| Static Party Pros preview missing | No Party Pros static route in `apps/starter-app` | Add generated static fixture route if that path is selected |
| Form proof blocked | No Party Pros page rendered | Render `party-pros-quote-request` without invoking submit |
| Admin boundary must remain local | Starter source classifies `/admin` as tenant-site-local | Preserve boundary and keep platform controls in standalone Admin UI |

V2.8.61OJ should resolve the preview path choice before any deploy, appsetting mutation, publish, DNS, or POST action.

