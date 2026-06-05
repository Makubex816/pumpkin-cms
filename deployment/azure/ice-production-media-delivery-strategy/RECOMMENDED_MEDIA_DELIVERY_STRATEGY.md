# Recommended Media Delivery Strategy

## Recommendation

Recommend a future explicit approval for:

```text
Option A: public Blob read for approved checksum-versioned marketing media, delivered through Cloudflare at media.iceskatingrinkrentals.com with a path rewrite to the Azure container-backed origin path.
```

Do not execute this recommendation without a separate approval.

## Why This Fits

The current need is public marketing-site imagery. These image URLs will be emitted into static HTML and should be:

- stable
- public
- cacheable
- free of query-string secrets
- easy for validators to check
- compatible with the locked media domain
- compatible with checksum-versioned immutable paths

Option A fits those needs with the least moving parts. Since the assets are already intended to be public marketing images, private Blob delivery adds secret and proxy complexity without much practical benefit for this specific content class.

## Important Constraint

The target production URL pattern does not include the Azure Blob container name:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

The direct Blob service path does include the container name:

```text
https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Therefore, the future Cloudflare delivery gate must include a path mapping strategy. A pure DNS CNAME is not enough.

## Recommended Future Gate Shape

Ask for explicit approval to perform only these next actions:

1. Enable anonymous Blob public access at the storage account if policy permits.
2. Set container public access to `blob` for `ice-rink-rentals-media`.
3. Configure `media.iceskatingrinkrentals.com` in Cloudflare.
4. Configure Cloudflare delivery with URL rewrite or Cloud Connector so public requests map to the Azure container-backed path.
5. Run anonymous `HEAD` checks for all 9 target production media URLs.
6. Document the result.

Stop after delivery verification. MediaAsset writes should remain a later approval.

## Fallback

If public Blob read is rejected by security policy, use Option B or Option C:

- Option B: private Blob plus Cloudflare Worker with server-side secret handling
- Option C: Azure Front Door/CDN with an approved private-origin or SAS strategy

Both fallbacks require more operational design and should be approved separately.

## Readiness After Diagnosis

- Static dry run completed: yes
- Static route output ready: yes
- Azure media files uploaded: yes
- Public media delivery configured: no
- Media production URL readiness: no
- Contact form production readiness: no
- Azure staging readiness: no
- DNS cutover readiness: no
- Production/indexing readiness: not live-ready
- Roller: paused

