# Source-Discovered Setting Map

## Static Contact Compat

| Setting | Classification | Source | Purpose |
| --- | --- | --- | --- |
| `FORM_DELIVERY_MODE` | public-safe | `contact-handler.mjs:190-200` | Selects `pumpkin-api` delivery mode. |
| `PUMPKIN_API_URL` | public-safe URL | `contact-handler.mjs:234-250` | Pumpkin API base URL. |
| `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME` | public-safe setting-name pointer | `contact-handler.mjs:253-260` | Selects which env var contains the tenant API key. |
| `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` | protected | `contact-handler.mjs:207-224` plus env-name pointer | Bearer key used by static contact when forwarding to Pumpkin API. |
| `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE` | public-safe route guard | `contact-handler.mjs:263-277` | Optional explicit route; must match `/api/forms/{tenantId}/entries`. |
| `STATIC_FORM_ALLOWED_SITE_KEYS` | public-safe | `validate-static-form-payload.mjs:84-91` | Restricts accepted site keys. |
| `STATIC_FORM_ALLOWED_ORIGINS` | public-safe | `contact-handler.mjs:15-43`, `validate-static-form-payload.mjs:93-97` | Restricts CORS/origin validation. |

## Pumpkin API

| Setting or route | Classification | Source | Purpose |
| --- | --- | --- | --- |
| `POST /api/forms/{tenantId}/entries` | public route shape | `Program.cs:304-322` | FormEntry write endpoint used by static contact. |
| `GET /api/admin/{tenantId}/form-entries` | protected route shape | `Program.cs:1247-1276` | Admin Lead Inbox list endpoint. |
| `Database__Provider` | public-safe | `DatabaseSettings.cs:5-13`, `DatabaseService.cs:25-31` | Selects `CosmosDb` or `MongoDb`. |
| `Database__CosmosDb__ConnectionString` | protected | `DatabaseSettings.cs:25-31`, `CosmosDataConnection.cs:20-41` | Cosmos connection used by FormEntry writes and Admin reads. |
| `Database__CosmosDb__DatabaseName` | public-safe | `DatabaseSettings.cs:25-31`, `CosmosDataConnection.cs:40-41` | Cosmos database name. |
| `Jwt__SecretKey` | protected | `Program.cs:81-107`, `Program.cs:407-423` | JWT validation and login token signing. |
| `Jwt__Issuer` | public-safe | `Program.cs:103`, `Program.cs:426` | JWT issuer. |
| `Jwt__Audience` | public-safe | `Program.cs:104`, `Program.cs:427` | JWT audience. |
| `Jwt__ExpirationMinutes` | public-safe | `Program.cs:422` | Login token lifetime. |

`PUMPKIN_API_FORMENTRY_PROVIDER_BINDING_SECRET` was not found as a source-used app-setting name. The API validates the Bearer key by comparing it to the tenant's stored hash in the database.
