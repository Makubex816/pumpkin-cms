# Public URL Validation Plan

## Future Validation

After future Cloudflare execution, validate all 9 URLs under:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/
```

For each URL, confirm:

- HTTP status `200`
- `Content-Type: image/png`
- response length is nonzero
- no SAS query string
- no redirect to `iceskatingmedia.blob.core.windows.net`
- cache-control is immutable or intentionally equivalent

## Current Azure Origin Status

Direct Azure Blob URLs are publicly readable for all 9 approved media files.

Cloudflare validation remains future work because no Cloudflare/DNS changes have occurred.
