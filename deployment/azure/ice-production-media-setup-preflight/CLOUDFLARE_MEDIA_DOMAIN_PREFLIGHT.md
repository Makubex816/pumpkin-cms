# Cloudflare Media Domain Preflight

Generated: 2026-06-04

## Scope

This is a Cloudflare media-domain plan only. No Cloudflare credentials were read, no DNS records were changed, no cache rules were changed, and no validation commands were executed against Cloudflare.

## Target Domain

```text
media.iceskatingrinkrentals.com
```

## Expected DNS Target

Expected record type:

```text
CNAME
```

Expected target placeholder:

```text
<approved-azure-blob-origin-host-or-approved-media-origin>
```

The exact target depends on the approved Azure Blob/static origin design and must be confirmed before DNS changes.

## SSL/TLS Requirements

Future setup must confirm:

- HTTPS works for `media.iceskatingrinkrentals.com`
- Cloudflare SSL/TLS mode is compatible with the approved Azure origin
- the origin certificate and Cloudflare edge certificate are valid
- requests do not downgrade to HTTP
- media URLs return correct status and content type

## Cache Behavior

Checksum-versioned paths should allow long-lived immutable caching after origin behavior is verified:

```text
Cache-Control: public, max-age=31536000, immutable
```

Future cache rules should avoid caching unexpected mutable API responses, redirects, or error pages as media.

## Redirect And Canonical Considerations

- The media hostname should serve assets directly, not redirect to the primary site.
- Primary site canonical URLs should remain on `https://iceskatingrinkrentals.com`.
- Media URLs should not become crawlable page URLs.
- Avoid redirect loops between Cloudflare and Azure origin.

## Future Validation Commands

Run only after explicit approval and DNS setup:

```powershell
Resolve-DnsName media.iceskatingrinkrentals.com
curl.exe -I https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Expected future checks:

- DNS resolves to the approved target
- HTTPS certificate is valid
- response status is `200`
- `Content-Type` matches image type
- cache headers match policy
- no unexpected redirects

## Required Approval Before DNS Changes

Explicit user approval is required before:

- creating or changing Cloudflare DNS records
- configuring Cloudflare cache rules
- changing origin routing
- purging Cloudflare cache
- validating production DNS externally as an execution step
- marking media domain readiness `yes`

## Current Run Result

No Cloudflare or DNS changes occurred.
