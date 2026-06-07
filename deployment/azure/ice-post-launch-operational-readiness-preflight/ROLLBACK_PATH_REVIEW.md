# Rollback Path Review

Generated: 2026-06-06

## Result

Rollback paths are documented and reviewable. No rollback was executed.

During this preflight the user wrote "approval given" after a status note about rollback paths requiring separate approval. Because live production health passed and no exact rollback target was named, this package treats rollback as reviewed and ready for action-specific approval, not as an instruction to roll back production.

## Azure Static Web App Custom Domain and Root/WWW DNS

Source: `deployment/azure/ice-production-cutover-result/ROLLBACK_PLAN.md`

Fast DNS rollback would restore only the captured root/www Cloudflare records:

| Name | Type | Content | Proxied | TTL |
| --- | --- | --- | --- | --- |
| `iceskatingrinkrentals.com` | A | `66.81.203.198` | false | auto |
| `www.iceskatingrinkrentals.com` | A | `66.81.203.198` | false | auto |

Preserve media, MX, SPF, Microsoft 365 TXT, and autodiscover records.

Optional Azure cleanup after traffic rollback would require separate approval:

- remove `www.iceskatingrinkrentals.com` from `swa-ice-static-staging`
- remove `iceskatingrinkrentals.com` from `swa-ice-static-staging`
- remove only Azure Static Web Apps validation TXT records, not Microsoft 365/SPF records

## Static Site Content Redeploy

Source: `deployment/azure/ice-production-indexing-cleanup-result/ROLLBACK_NOTES.md`

If static content rollback is required, redeploy a previously known-good Ice static artifact to:

```text
Static Web App: swa-ice-static-staging
resource group: rg-ice-static-staging
default hostname: happy-mud-0b375e20f.7.azurestaticapps.net
custom domains: iceskatingrinkrentals.com, www.iceskatingrinkrentals.com
```

Use Azure Static Web Apps deployment history or preserved artifacts if available. Keep deployment tokens out of repository files and command output.

## Cloudflare Media Worker

Source: `deployment/azure/ice-production-media-worker-delivery-result/ROLLBACK_NOTES.md`

Rollback should be limited to the media-scoped objects:

- proxied CNAME `media.iceskatingrinkrentals.com` to `iceskatingmedia.blob.core.windows.net`
- Worker script `ice-media-delivery`
- Worker route `media.iceskatingrinkrentals.com/ice-rink-rentals/assets/*`

Suggested order:

1. Remove the Worker route.
2. Remove or disable the Worker script if no other approved route uses it.
3. Remove the proxied media CNAME only if no approved media route depends on it.

Do not alter root, `www`, MX/TXT/email DNS, CMS records, MediaAsset records, Azure storage settings, blobs, deployments, Microsoft 365 settings, or Roller.

## Azure Blob Media

Source: `deployment/azure/ice-production-media-upload-result/README.md`

Media upload result was 9 approved PNG assets in storage account `iceskatingmedia`, container `ice-rink-rentals-media`, path pattern:

```text
ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Operational rollback should avoid deleting blobs unless a future media-specific rollback is explicitly approved. The safer fast rollback path for media delivery is usually Cloudflare Worker/route/DNS rollback, not blob deletion.

## Static Form Endpoint Production Mode

Sources:

- `deployment/azure/ice-static-form-production-enablement-result/ROLLBACK_DISABLE_PLAN.md`
- `deployment/azure/ice-static-form-production-enablement-result/FUNCTION_APP_SETTINGS_RESULT.md`

Immediate mail disable rollback would set:

```text
FORM_DELIVERY_MODE=no-email
```

Validation contexts can unset or set:

```text
STATIC_FORM_ENDPOINT_VERIFIED=false
```

This would require separate Function setting approval. Do not redeploy the endpoint unless separately approved.

## Noindex/Indexing Delay

Current public pages are indexable and Search Console has not been used. If final indexing is delayed, no rollback is required because no Search Console submission, sitemap submission, URL Inspection request, or indexing request has occurred.

Changing robots, sitemap, or page `noindex` policy would be a separate explicit approval and was not performed.
