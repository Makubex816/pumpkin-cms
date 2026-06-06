# Pre-Change CORS Check

Generated: 2026-06-06

## Target

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

## Result

Before the approved setting change, safe OPTIONS checks showed:

| Origin | Status | Allow-Origin | Result |
| --- | --- | --- | --- |
| `https://happy-mud-0b375e20f.7.azurestaticapps.net` | 204 | none | blocked |
| `https://iceskatingrinkrentals.com` | 204 | `https://iceskatingrinkrentals.com` | allowed |

The staging default hostname was the only blocker found in the previous Azure Static Web Apps staging deployment result.

No POST payload was sent in the pre-change check.
