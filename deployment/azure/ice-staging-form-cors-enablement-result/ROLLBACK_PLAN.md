# Rollback Plan

Generated: 2026-06-06

## Rollback Scope

If the staging origin must be removed later, use a separate explicit Function setting approval to restore:

```text
STATIC_FORM_ALLOWED_ORIGINS=https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com
```

Do not remove production origins.

## Do Not Roll Back By Changing

- endpoint code or deployment package
- Microsoft 365 settings
- Graph credentials
- `FORM_DELIVERY_MODE`
- CMS content
- MediaAsset records
- Cloudflare records/cache
- DNS
- static site deployment
- Roller state

No rollback was needed in this pass.
