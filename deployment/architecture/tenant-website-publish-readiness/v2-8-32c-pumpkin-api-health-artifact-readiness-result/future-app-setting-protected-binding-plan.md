# Future App Setting Protected Binding Plan

This plan names settings only. No values were read, generated, printed, or set in V2.8.32C.

## Pumpkin API App Service Setting Names

| Setting name | Classification | Notes |
| --- | --- | --- |
| `ASPNETCORE_ENVIRONMENT` | non-secret value | Use an operator-approved production environment label. |
| `Database__Provider` | non-secret value | Expected value for this lane: `CosmosDb`. |
| `Database__CosmosDb__DatabaseName` | non-secret or sensitive-by-policy | Planned database from V2.8.32B: `pumpkin-prod-cms`. |
| `Database__CosmosDb__ConnectionString` | protected | Must be supplied through an approved secret-safe flow or Key Vault reference. |
| `Database__CosmosDb__PreferredRegions` | non-secret value | Use only if operator approves region preference. |
| `Jwt__Issuer` | protected or sensitive-by-policy | Required for Admin auth. |
| `Jwt__Audience` | protected or sensitive-by-policy | Required for Admin auth. |
| `Jwt__SecretKey` | protected | Required for JWT validation. |

## Static Contact Binding Names For Later Phase

| Setting name | Purpose |
| --- | --- |
| `FORM_DELIVERY_MODE` | Select `pumpkin-api` mode after deployment proof. |
| `PUMPKIN_API_URL` | Same verified Pumpkin API base URL. |
| `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE` | `/api/forms/ice-rink-rentals/entries`. |
| `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME` | Name of protected API key env var. |
| `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` | Protected API key value. |

## Admin Binding Names For Later Phase

| Setting name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Same verified Pumpkin API base URL. |

## Boundaries

- No app settings list/show/set occurred.
- No protected config was read.
- No connection string, key, token, SAS, or secret value was generated.
