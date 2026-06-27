# Tenant/Site/Form Binding Worksheet

## Public-Safe Values Known Now

| Binding | Value | Source |
| --- | --- | --- |
| Site key | `ice-rink-rentals` | compat site config |
| Tenant ID | `ice-rink-rentals` | operator env and compat site config |
| Domain | `iceskatingrinkrentals.com` | compat site config |
| WWW domain | `www.iceskatingrinkrentals.com` | compat site config |
| Public route | `/contact` | V2.8.26 carryforward |
| Static endpoint | `/api/static-contact` | V2.8.26 carryforward |
| Form ID | `default-quote-request` | operator env |
| Form key | `default-quote-request` | compat default |
| Entry ID prefix | `ice-rink-rentals-default-quote-request-` | compat entry builder |
| Static endpoint ref | `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` | frontend/site mapping |
| Lead recipient ref | `ICE_RINK_RENTALS_LEAD_RECIPIENT` | frontend/site mapping |
| Public email | `contact@iceskatingrinkrentals.com` | operator-approved public display/mailto |

## Required Next Bindings

| Binding | Public or protected | Required for Admin persistence | Notes |
| --- | --- | --- | --- |
| `FORM_DELIVERY_MODE` | public-safe value, app setting mutation gated | yes | Must resolve to `pumpkin-api`. |
| `PUMPKIN_API_URL` | protected binding value not read here | yes | Must target same backend/provider Admin reads. |
| `ICE_RINK_RENTALS_API_KEY` | secret | yes | Tenant API key for Pumpkin API form entry write. |
| `STATIC_FORM_ALLOWED_SITE_KEYS` | public-safe value, app setting mutation gated | recommended | Should include `ice-rink-rentals`. |
| `STATIC_FORM_ALLOWED_ORIGINS` | public-safe value, app setting mutation gated | recommended | Should include approved Ice origins. |

## Binding Rule

The Pumpkin API target must be the same environment/backend read by the Admin Lead Inbox used for validation. A successful write to a different Pumpkin API environment does not close the gate.
