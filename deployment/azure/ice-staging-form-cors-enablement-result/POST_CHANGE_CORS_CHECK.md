# Post-Change CORS Check

Generated: 2026-06-06

## OPTIONS Checks

Safe OPTIONS checks after the setting change:

| Origin | Status | Allow-Origin | Allow-Methods | Allow-Headers |
| --- | --- | --- | --- | --- |
| `https://happy-mud-0b375e20f.7.azurestaticapps.net` | 204 | `https://happy-mud-0b375e20f.7.azurestaticapps.net` | `OPTIONS, POST` | `Content-Type` |
| `https://iceskatingrinkrentals.com` | 204 | `https://iceskatingrinkrentals.com` | `OPTIONS, POST` | `Content-Type` |
| `https://www.iceskatingrinkrentals.com` | 204 | `https://www.iceskatingrinkrentals.com` | `OPTIONS, POST` | `Content-Type` |

Result: staging browser-origin preflight readiness passed.

## Invalid Payload Check

An invalid empty JSON POST was sent from the staging origin to prove the browser-origin response path without sending a valid lead.

| Check | Result |
| --- | --- |
| status | 400 |
| allow-origin | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |
| content type | `application/json` |
| response ok | false |
| message | `Please check the highlighted form fields.` |
| valid payload sent | no |
| email sent | no |

No valid form submission occurred.
