# Public-Safe Binding Values

Public-safe values used or confirmed:

| Name | Value |
| --- | --- |
| `PUMPKIN_API_CANONICAL_URL` | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net` |
| `PUMPKIN_STATIC_CONTACT_SWA_NAME` | `swa-ice-static-staging` |
| `PUMPKIN_STATIC_CONTACT_SWA_RESOURCE_GROUP` | `rg-ice-static-staging` |
| `PUMPKIN_CONTACT_DELIVERY_REMEDIATION_MODE` | `admin-persistence-required` |
| `PUMPKIN_CONTACT_DELIVERY_FORM_TENANT_ID` | `ice-rink-rentals` |
| `PUMPKIN_CONTACT_DELIVERY_FORM_ID` | `default-quote-request` |
| `PUMPKIN_CONTACT_DELIVERY_PUBLIC_EMAIL` | `contact@iceskatingrinkrentals.com` |
| `PUMPKIN_CONTACT_DELIVERY_DUAL_DELIVERY_TARGET` | `future-optional-after-admin-persistence` |
| `PUMPKIN_STATIC_CONTACT_PRODUCTION_APEX` | `https://iceskatingrinkrentals.com` |
| `PUMPKIN_STATIC_CONTACT_PRODUCTION_WWW` | `https://www.iceskatingrinkrentals.com` |

Public-safe values bound to the Static Web App:

- `FORM_DELIVERY_MODE=pumpkin-api`
- `PUMPKIN_API_URL=https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE=/api/forms/ice-rink-rentals/entries`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME=PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- `STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals`
- `STATIC_FORM_ALLOWED_ORIGINS=https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com`
