# Protected Value Name Matrix

No protected values were read. This matrix lists names and purposes only.

| Name | Target | Purpose | Handling |
| --- | --- | --- | --- |
| `Jwt__SecretKey` | Pumpkin API | Signs Admin JWTs | Protected App Service setting or Key Vault reference |
| `Database__CosmosDb__ConnectionString` | Pumpkin API | Cosmos provider connection material | Protected App Service setting or Key Vault reference |
| `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` | Static contact managed API | Ice tenant API key for server-to-server contact writes | Protected setting, value never printed |
| `PUMPKIN_ADMIN_JWT` | Operator/runtime QA shell only | Approved Admin API read-only checks | Presence/value not required in V2.8.32B |
| `Jwt--SecretKey` | Key Vault secret name option | Key Vault backing secret for `Jwt__SecretKey` | Optional protected secret object |
| `Database--CosmosDb--ConnectionString` | Key Vault secret name option | Key Vault backing secret for Cosmos connection setting | Optional protected secret object |

## Non-secret setting names with public-safe values

| Name | Target | Planned value |
| --- | --- | --- |
| `Database__Provider` | Pumpkin API | `CosmosDb` |
| `Database__CosmosDb__DatabaseName` | Pumpkin API | `pumpkin-prod-cms` |
| `Database__CosmosDb__PreferredRegions` | Pumpkin API | `East US` |
| `NEXT_PUBLIC_API_URL` | Admin | Verified Pumpkin API base URL |
| `FORM_DELIVERY_MODE` | Static contact | `pumpkin-api` after isolated binding approval |
| `PUMPKIN_API_URL` | Static contact | Verified Pumpkin API base URL |
| `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE` | Static contact | `/api/forms/ice-rink-rentals/entries` |
| `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME` | Static contact | `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` |
| `STATIC_FORM_ALLOWED_SITE_KEYS` | Static contact | `ice-rink-rentals` |
| `STATIC_FORM_ALLOWED_ORIGINS` | Static contact | Approved isolated or production origins per lane |

## RBAC and identity

Preferred identity plan: enable system-assigned managed identity for the App Service so Key Vault references can resolve protected values. Cosmos data-plane managed identity should remain a future hardening path unless the API source is updated to use Azure identity instead of connection string configuration.
