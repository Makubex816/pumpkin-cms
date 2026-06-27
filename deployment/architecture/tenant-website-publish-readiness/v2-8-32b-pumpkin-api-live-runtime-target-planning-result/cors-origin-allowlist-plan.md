# CORS Origin Allowlist Plan

## Pumpkin API CORS behavior

Public tenant routes, including `POST /api/forms/{tenantId}/entries`, use `TenantCors`. The source loads allowed origins from tenant settings and denies CORS when no allowed origins are configured.

Admin/auth routes currently use the default Admin/API CORS behavior from source. This plan does not harden Admin CORS yet; it focuses on unblocking the contact persistence proof.

## Tenant allowed origins required before browser/runtime QA

For `ice-rink-rentals`, the tenant allowed origins should include:

| Lane | Origin |
| --- | --- |
| Production custom domain | `https://iceskatingrinkrentals.com` |
| Production www domain | `https://www.iceskatingrinkrentals.com` |
| Production SWA default host | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |
| Isolated SWA default host | `https://kind-island-0a85a740f.7.azurestaticapps.net` |

## Static contact allowed origins

The static contact managed API must separately bind:

| Lane | `STATIC_FORM_ALLOWED_ORIGINS` |
| --- | --- |
| Isolated first | `https://kind-island-0a85a740f.7.azurestaticapps.net` |
| Production later | `https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com,https://happy-mud-0b375e20f.7.azurestaticapps.net` |

## QA order

1. Verify API host and provider first.
2. Verify tenant allowed origins are ready.
3. Verify static contact allowed origins on isolated SWA.
4. Run OPTIONS checks only after explicit runtime QA approval.
5. Run the isolated POST only after OPTIONS and Admin read-only checks pass.
