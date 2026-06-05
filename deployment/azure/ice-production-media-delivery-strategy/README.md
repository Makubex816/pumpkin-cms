# Ice Production Media Delivery Strategy

Date: 2026-06-05

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Scope

This package documents a diagnosis only. It evaluates how to serve the 9 uploaded Ice Azure Blob media files through:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

No delivery, access, DNS, CMS, MediaAsset, deployment, email, Microsoft 365, or Roller changes were made.

## Current Findings

- Azure Blob upload state: 9 expected blobs present, 0 missing, 0 unexpected.
- Storage account: `iceskatingmedia`.
- Container: `ice-rink-rentals-media`.
- Account anonymous blob access: `false`.
- Container public access: `null`.
- Azure custom domain: `null`.
- Public direct Blob URL smoke check: anonymous `HEAD` returned `409 Public access is not permitted on this storage account.`
- `media.iceskatingrinkrentals.com` did not resolve in the local DNS check.

## Recommendation

For public marketing-site imagery, checksum-versioned paths, simple static HTML, and no secrets in page markup, the recommended next gate is:

```text
Option A: public blob read for the approved media container, plus Cloudflare proxied delivery/routing and a path rewrite that maps the public URL path to the Azure container-backed origin path.
```

This should be approved separately before execution. A plain CNAME to Azure Blob is not enough for the locked target URL pattern because Azure Blob service URLs include the container segment:

```text
https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/{blobPath}
```

while the locked production URL omits `ice-rink-rentals-media`:

```text
https://media.iceskatingrinkrentals.com/{blobPath}
```

## Source References

- Azure anonymous Blob read access: https://learn.microsoft.com/en-us/azure/storage/blobs/anonymous-read-access-configure
- Azure Blob custom domains and HTTPS guidance: https://learn.microsoft.com/en-us/azure/storage/blobs/storage-custom-domain-name
- Azure Front Door with Azure Storage: https://learn.microsoft.com/en-us/azure/frontdoor/integrate-storage-account
- Azure Front Door origins: https://learn.microsoft.com/en-us/azure/frontdoor/how-to-configure-origin
- Cloudflare proxy status: https://developers.cloudflare.com/dns/proxy-status/
- Cloudflare Cloud Connector overview: https://developers.cloudflare.com/rules/cloud-connector/
- Cloudflare Cloud Connector Azure Blob example: https://developers.cloudflare.com/rules/cloud-connector/examples/serve-static-assets-from-azure/
- Cloudflare Cloud Connector providers: https://developers.cloudflare.com/rules/cloud-connector/providers/
- Cloudflare Origin Rules host header and DNS override: https://developers.cloudflare.com/rules/origin-rules/features/
- Cloudflare cache behavior: https://developers.cloudflare.com/cache/concepts/default-cache-behavior/

## Files

- `CURRENT_BLOB_ACCESS_STATE.md`
- `PUBLIC_BLOB_URL_SMOKE_CHECK.md`
- `DELIVERY_OPTION_A_PUBLIC_BLOB_CLOUDFLARE.md`
- `DELIVERY_OPTION_B_PRIVATE_BLOB_WORKER.md`
- `DELIVERY_OPTION_C_AZURE_CDN_FRONTDOOR.md`
- `DELIVERY_OPTION_D_DEFER.md`
- `RECOMMENDED_MEDIA_DELIVERY_STRATEGY.md`
- `APPROVAL_REQUIRED_FOR_NEXT_ACTION.md`
- `FUTURE_CLOUDFLARE_DNS_PLAN.md`
- `FUTURE_MEDIAASSET_UPDATE_DEPENDENCIES.md`
- `REMAINING_MEDIA_DELIVERY_RISKS.md`
- `manifest.json`
