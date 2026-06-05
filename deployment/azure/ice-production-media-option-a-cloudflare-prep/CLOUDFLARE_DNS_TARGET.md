# Cloudflare DNS Target

## Future Hostname

```text
media.iceskatingrinkrentals.com
```

## Future Purpose

Serve public Ice media files from Azure Blob through Cloudflare using the selected Option A strategy.

## Required Future DNS Record

Future Cloudflare execution will need a DNS/proxy configuration for:

```text
media.iceskatingrinkrentals.com
```

The final Cloudflare mechanism is not executed in this package.

## Constraints

- do not change apex or `www` records as part of the media-only gate
- do not alter email/MX/TXT/Microsoft 365 records
- do not enable production site cutover
- use HTTPS
- avoid Flexible SSL
- validate the media hostname before MediaAsset writes

## Current Status

No Cloudflare/DNS changes have occurred.

