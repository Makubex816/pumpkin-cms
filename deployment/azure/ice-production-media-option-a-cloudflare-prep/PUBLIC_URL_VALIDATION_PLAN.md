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

## Current Status

Direct Azure Blob URLs are not publicly readable yet. Cloudflare validation remains blocked.

