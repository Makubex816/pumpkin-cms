# Public Contact To Pumpkin API Persistence Map

## Intended public path

| Step | Runtime path | Notes |
| --- | --- | --- |
| Browser submit | `https://iceskatingrinkrentals.com/contact` | Public production site; no production submit was performed in this phase |
| Static contact endpoint | Same-origin `/api/static-contact` | Production path carried forward from V2.8.26 |
| Static contact adapter | `FORM_DELIVERY_MODE=pumpkin-api` | V2.8.31 local behavior supports this mode |
| Pumpkin API write | `POST /api/forms/ice-rink-rentals/entries` | Source route exists at `apps/pumpkin-api/Program.cs:252` |
| Persistence | `FormEntry` saved through configured provider | Must target production Cosmos `forms` container |
| Admin read | `GET /api/admin/ice-rink-rentals/form-entries` | Source route exists at `apps/pumpkin-api/Program.cs:1195` |

## Static adapter requirements

The static contact adapter requires these name-only bindings for Pumpkin API mode:

- `FORM_DELIVERY_MODE=pumpkin-api`
- `PUMPKIN_API_URL`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE=/api/forms/ice-rink-rentals/entries`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME=PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- allowed site key/origin settings for the Ice site

No values were read in this phase.

## Current blocker

The public path cannot be completed because current metadata does not show a live Pumpkin API Web App/App Service host. Binding `/api/static-contact` to an unverified candidate URL would risk accepting another contact payload without Admin-visible persistence.
