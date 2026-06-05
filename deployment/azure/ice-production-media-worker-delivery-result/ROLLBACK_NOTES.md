# Rollback Notes

Date: 2026-06-05

## Configured Cloudflare Objects

This run configured:

- proxied CNAME `media.iceskatingrinkrentals.com` to `iceskatingmedia.blob.core.windows.net`
- Worker script `ice-media-delivery`
- Worker route `media.iceskatingrinkrentals.com/ice-rink-rentals/assets/*`

## Rollback Scope

If rollback is separately approved, limit rollback to the objects above.

Do not alter:

- root/apex DNS
- `www` DNS
- MX/TXT/email DNS
- main-site records
- CMS records
- MediaAsset records
- Azure storage settings
- Azure blobs
- static or production deployment artifacts
- Microsoft 365 settings
- Roller records or assets

## Suggested Rollback Order

1. Remove the Worker route for `media.iceskatingrinkrentals.com/ice-rink-rentals/assets/*`.
2. Remove or disable the `ice-media-delivery` Worker script if no other approved route uses it.
3. Remove the proxied `media.iceskatingrinkrentals.com` CNAME only if no approved media route depends on it.

No rollback was performed in this run.
