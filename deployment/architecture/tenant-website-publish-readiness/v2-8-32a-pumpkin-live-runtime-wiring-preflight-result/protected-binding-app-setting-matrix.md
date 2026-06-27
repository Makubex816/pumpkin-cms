# Protected Binding App Setting Matrix

Values were not read. This file records required setting names, expected owners, and when they may be bound.

| Setting name | Target runtime | Purpose | Current status | Approval needed |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Admin | Browser-visible Pumpkin API base URL | Live value unknown | Admin runtime binding approval |
| `FORM_DELIVERY_MODE` | Static contact managed API | Selects `pumpkin-api` mode | Live value unknown | Static contact binding approval |
| `PUMPKIN_API_URL` | Static contact managed API | Pumpkin API base URL for forwarding | Live value unknown | Static contact binding approval after API host verification |
| `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE` | Static contact managed API | Locks write path to Ice tenant route | Live value unknown | Static contact binding approval |
| `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME` | Static contact managed API | Names the protected key variable | Live value unknown | Static contact binding approval |
| `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` | Static contact managed API | Protected tenant API key value | Not read | Protected secret-binding approval |
| `STATIC_FORM_ALLOWED_SITE_KEYS` | Static contact managed API | Allows expected public site keys | Live value unknown | Static contact binding approval |
| `STATIC_FORM_ALLOWED_ORIGINS` | Static contact managed API | Allows Ice public origins | Live value unknown | Static contact binding approval |
| `Database:Provider` or equivalent provider selector | Pumpkin API | Selects Cosmos provider | Live value unknown | API runtime provider-binding approval |
| Cosmos endpoint/database/container settings | Pumpkin API | Connects API to production Cosmos | Not read | Protected provider-binding approval |
| JWT/signing/auth settings | Pumpkin API/Admin | Admin authentication | Not read | Protected auth binding approval |

## Boundary note

Azure app setting list/show/set operations were intentionally not run. Protected values must be handled by an operator-approved secret-binding workflow, not by printing or copying config through Codex.
