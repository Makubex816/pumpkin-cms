# Preview Security Notes

## Controls Preserved

- Preview routes are disabled in static render mode.
- Preview routes include noindex/nofollow/nocache metadata.
- Draft data loading requires manual admin JWT entry in the browser.
- The token input remains a password field.
- Tokens are stored only in browser `sessionStorage`.
- No JWTs, secrets, provider config, or protected config files were printed.

## CMS Safety

This change only updates frontend preview routing and rendering support. It does not write CMS records, import pages, approve pages, publish pages, update Theme records, or update MediaAssets.

## Public Content Safety

The public `/service-areas` route remains separate from the preview route and still returns 404 until live CMS promotion occurs.
