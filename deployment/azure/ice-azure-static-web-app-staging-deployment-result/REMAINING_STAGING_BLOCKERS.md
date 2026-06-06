# Remaining Staging Blockers

Generated: 2026-06-06

## Blockers

Azure staging content is deployed and serving, but full staging readiness is blocked by form-origin CORS.

Current blocker:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

The endpoint allows `https://iceskatingrinkrentals.com` but did not return CORS allow-origin headers for:

```text
https://happy-mud-0b375e20f.7.azurestaticapps.net
```

This run did not approve or perform Function App setting changes, so the allowed-origin list was not changed.

## Still Not Ready

- browser form submission from the staging hostname
- custom staging domain
- production DNS cutover
- Cloudflare changes
- production/indexing readiness

Roller remains paused.
