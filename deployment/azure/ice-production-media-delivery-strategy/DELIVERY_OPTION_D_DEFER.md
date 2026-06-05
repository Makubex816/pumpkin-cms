# Option D: Defer Media Delivery

## Summary

Do not proceed with public media delivery until an explicit security and access policy is chosen.

This keeps the current state unchanged:

```text
allowBlobPublicAccess: false
container publicAccess: null
public media delivery configured: no
```

## Required Future Changes

No immediate changes.

Future work would require one of these explicit decisions:

- approve public Blob read for public marketing imagery
- approve a private-origin edge proxy strategy
- approve Azure Front Door/CDN delivery
- move the media to another approved public asset host

## Security Tradeoffs

Pros:

- no new public access
- no new DNS or Cloudflare surface
- no new secrets
- no risk of accidental public exposure beyond the current uploaded private blobs

Cons:

- media production URL readiness remains blocked
- MediaAsset records cannot safely be updated to production media URLs
- static validators will continue to fail on local media URL references
- staging and DNS cutover remain blocked

## Compatibility

Does not support the locked target URL pattern because no delivery layer is configured.

## Stable Public Image URLs

Not supported until another option is approved and implemented.

## Secrets

No secrets are required because no delivery action occurs.

## Cloudflare/DNS

No Cloudflare or DNS changes are required.

## MediaAsset Updates

MediaAsset updates remain blocked.

## Fit For Current Project

This is the safest option if the project owner is not ready to choose public Blob read, Worker-based private delivery, or Azure Front Door/CDN. It does not advance production readiness.

