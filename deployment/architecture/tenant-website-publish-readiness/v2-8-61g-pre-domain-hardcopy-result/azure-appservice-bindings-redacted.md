# Azure App Service Bindings Redacted

| App Service | Resource group | State | Appsetting names read | Publishing profiles read | Hostnames read |
| --- | --- | --- | ---: | ---: | ---: |
| `func-ice-static-contact-20260605` | `rg-ice-static-form-endpoint` | Running | 28 | 3 | 1 |
| `app-pumpkin-api-prod-centralus-001` | `rg-pumpkin-api-prod-centralus` | Running | 8 | 3 | 1 |
| `app-pumpkin-admin-isolated-centralus-001` | `rg-pumpkin-api-prod-centralus` | Running | 6 | 3 | 1 |
| `app-pumpkin-admin-prod-centralus-001` | `rg-pumpkin-api-prod-centralus` | Running | 6 | 3 | 1 |
| `app-airstrip-preview-isolated-centralus-001` | `rg-pumpkin-api-prod-centralus` | Running | 5 | 3 | 1 |
| `app-airstrip-prod-centralus-001` | `rg-pumpkin-api-prod-centralus` | Running | 6 | 3 | 1 |

Pumpkin API setting names observed:

- `Database__CosmosDb__ConnectionString`
- `Database__CosmosDb__DatabaseName`
- `Database__Provider`
- `Jwt__Audience`
- `Jwt__ExpirationMinutes`
- `Jwt__Issuer`
- `Jwt__SecretKey`
- `DIAGNOSTICS_AZUREBLOBRETENTIONINDAYS`

Airstrip production setting names observed:

- `NEXT_PUBLIC_API_URL`
- `NODE_ENV`
- `PUMPKIN_API_KEY`
- `PUMPKIN_TENANT_ID`
- `PUMPKIN_THEME_FILE`
- `SCM_DO_BUILD_DURING_DEPLOYMENT`

Values are present only in the outside hardcopy.
