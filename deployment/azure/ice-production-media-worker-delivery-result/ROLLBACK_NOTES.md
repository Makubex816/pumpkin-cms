# Rollback Notes

Date: 2026-06-05

## Current Rollback Need

No Cloudflare Worker media configuration was created in this run.

Current state:

```text
media DNS record created: no
Worker script created: no
Worker route created: no
```

No rollback action is currently required.

## If A Future Worker Media Setup Succeeds

Rollback should remove only Worker-media-scoped configuration created for:

- `media.iceskatingrinkrentals.com` DNS/proxy
- Ice media Worker script
- Worker route for `media.iceskatingrinkrentals.com/ice-rink-rentals/assets/*`

Rollback must not alter:

- root/apex DNS
- `www` DNS
- MX/TXT/email records
- CMS records
- MediaAsset records
- deployments
- Microsoft 365 settings
- Roller

## No-Secret Confirmation

No token, key, connection string, or SAS URL was printed or written.
