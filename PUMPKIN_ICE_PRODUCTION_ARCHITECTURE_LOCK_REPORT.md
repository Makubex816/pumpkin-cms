# Pumpkin Ice Production Architecture Lock Report

Generated: 2026-06-04

## Scope

This is the official production architecture lock package for IceSkatingRinkRentals.com.

Architecture locked:

- Azure Static Web App hosts the public website/static frontend.
- Azure Cosmos DB stores Pumpkin CMS production data.
- Azure Blob Storage stores production media/image binaries.
- Cloudflare handles DNS/CDN/cache for website and media.
- Microsoft 365 remains the mailbox provider for `contact@iceskatingrinkrentals.com`.
- Pumpkin CMS remains editable after launch.
- Publishing remains manual and approval-gated.

No Azure resources, Cosmos resources, Blob containers, Cloudflare DNS records, deployments, static packages, CMS records, MediaAsset records, Microsoft 365 settings, email sending, protected config, or Roller work were performed.

## Start

Branch: `feature/admin-page-editor-import-export`

Git status at start:

```text
?? "content-review/ice-final-contact-input/contactimages/ChatGPT Image Jun 3, 2026, 01_25_32 PM.png"
?? "content-review/ice-final-contact-input/contactimages/ChatGPT Image Jun 3, 2026, 01_26_01 PM.png"
?? "content-review/ice-final-contact-input/contactimages/ChatGPT Image Jun 3, 2026, 12_37_40 PM.png"
?? content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/
?? content-review/ice-final-contact-input/ice-contact-page-phase9e-visual-pumpkin-rewrite.zip
?? content-review/ice-service-areas-input/extracted/ice-service-areas-phase11b-production-polish/
?? content-review/ice-service-areas-input/ice-service-areas-phase11b-production-polish.zip
```

Start state classification: no tracked modifications; existing raw contact/service-area input artifacts only. Safe to proceed with documentation-only architecture lock.

Recent log:

```text
799268f Add Ice live CMS pages approval lock
492a2a9 Add Ice final contact live CMS promotion report
5800b86 Add Ice contact media binding report
df01d84 Add Ice contact draft preview support
af471be Add Ice final contact local draft import report
8d66530 Add Ice final contact package intake
aa556a9 Add Ice service areas region grid polish report
9f2dbd2 Add Ice service areas live CMS promotion report
96d48cb Add Ice service areas polish report
2fa65d2 Add Ice service areas draft preview support
42f4c0c Add Ice service areas local draft import report
db145dd Add Ice cross page media slot plan
```

## Final Architecture

Website:

```text
https://iceskatingrinkrentals.com
  -> Cloudflare DNS/CDN/cache
  -> Azure Static Web App
```

Media:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/...
  -> Cloudflare CDN/cache
  -> Azure Blob Storage
```

CMS data:

```text
Pumpkin API/Admin
  -> Azure Cosmos DB
```

Email:

```text
Microsoft 365 Exchange Online Plan 1
  -> contact@iceskatingrinkrentals.com
```

Secrets:

```text
Azure app settings or Key Vault later
  -> never committed to repo
```

## Cosmos DB Production Data Plan

Cosmos stores tenants, sites, pages, drafts, live/published records, revisions, rollback metadata, themes/navigation, MediaAsset metadata, form definitions, form entries/leads, publish manifests, workflow/approval state, and audit/import/export records if supported.

Cosmos does not store image binaries, generated static files, deployment artifacts, secrets, API keys, SMTP credentials, Cloudflare tokens, Microsoft 365 credentials, or Azure storage keys.

Placeholder references only:

- `PUMPKIN_COSMOS_ENDPOINT_REF`
- `PUMPKIN_COSMOS_DATABASE_REF`
- `PUMPKIN_COSMOS_CONTAINER_REF`
- `PUMPKIN_COSMOS_AUTH_MODE_REF`
- `PUMPKIN_COSMOS_KEY_REF` or managed identity equivalent
- `ICE_RINK_RENTALS_TENANT_ID`
- `ICE_RINK_RENTALS_SITE_KEY`

Cosmos production status: planned, not provisioned.

## Azure Blob Media Plan

Azure Blob Storage stores production media/image binaries. MediaAsset metadata remains in Cosmos. Cloudflare fronts the media subdomain.

Media URL contract:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Production media must not use localhost `/media` URLs, fake URLs, base64 payloads, or unapproved external media URLs.

Blob/media production status: planned, not provisioned.

## MediaAsset Production Fields

Required production fields include `assetId`, `tenantId`, `siteKey`, `status`, `storageProvider`, `cdnProvider`, `originalFileName`, `safeFileName`, `checksum`, `width`, `height`, `mimeType`, `sourceBlobPath`, `publicUrl`, `thumbnailUrl`, `variants`, `altText`, `title`, `caption`, `description` or `notes`, `usageType`, `tags`, `createdAt`, `updatedAt`, `archivedAt` if archived, and `replacedByAssetId` if replaced.

Required provider values:

- `storageProvider`: `azure-blob`
- `cdnProvider`: `cloudflare`

## Cache Policy

For versioned image URLs:

```text
Cache-Control: public, max-age=31536000, immutable
```

Mutable manifests or indexes, if any, use short TTL or no-cache depending on runtime behavior.

Cloudflare caches `media.iceskatingrinkrentals.com/*` image assets. Purge should not be needed for checksum-versioned paths, but emergency purge is documented.

## Static Web App Plan

Azure Static Web App hosts the public generated site/app shell. Homepage `/`, contact `/contact`, and service areas `/service-areas` are current approved CMS routes.

Static generation must:

- use approved/live CMS content only
- exclude draft-only pages
- fail on localhost media URLs
- fail on missing production MediaAsset `publicUrl`
- fail on unresolved required media

Static generation status: not run.

Azure deployment status: not run.

## Publishing Workflow

Manual launch workflow:

1. Edit/preview in Pumpkin.
2. Approve live CMS page.
3. Validate CMS live pages.
4. Publish approved media to Blob.
5. Update MediaAsset production public URLs.
6. Generate static package from live CMS.
7. Validate static package.
8. Deploy to Azure staging/default domain.
9. Review staging.
10. Configure Cloudflare/custom domains after staging approval.
11. Cut over DNS.
12. Retain rollback package.

## Contact Form Production Plan

Microsoft 365 mailbox is operational manually. Pumpkin app sending remains dry-run unless separately configured.

The contact form production endpoint must be deployed and tested before production launch. Static form endpoint or Azure Function setup remains a separate setup gate. Do not assume production email sending is live just because the mailbox works.

Microsoft 365 settings touched: no.

Email sent: no.

## Rollback Plan

Rollback requires:

- previous static release package
- CMS revision/rollback metadata
- previous MediaAsset URLs available during rollback
- Cloudflare cache purge only if needed
- DNS rollback plan if custom domain cutover fails

## Production Infrastructure Status

| Area | Status |
| --- | --- |
| Static generation | not run |
| Azure resources | not created |
| Azure deployment | not run |
| Cloudflare DNS/CDN | not changed |
| Cosmos production database | planned, not provisioned |
| Blob/media production path | planned, not provisioned |
| Microsoft 365/email provider | not changed |
| CMS records | not changed |
| MediaAsset records | not changed |
| RollerRinkRentals.com | paused, untouched |

## Remaining Gates Before Azure Staging

- Approve production architecture setup sequence.
- Create Azure resources after explicit authorization.
- Provision Cosmos production database after explicit authorization.
- Provision Blob media path after explicit authorization.
- Publish approved media to Blob after explicit authorization.
- Update MediaAsset production URLs after explicit authorization.
- Run static generation from approved live CMS after explicit authorization.
- Validate static package.
- Deploy to Azure staging/default domain after explicit authorization.

## Remaining Gates Before DNS Cutover

- Complete Azure staging review.
- Confirm Cloudflare DNS/CDN plan.
- Confirm Microsoft 365/DNS mail safety.
- Confirm production indexing/sitemap policy.
- Confirm monitoring and rollback.
- Obtain explicit DNS/provider cutover approval.

## Checks

- JSON parse validation for manifest: pass
- git diff --check: pass
- trailing whitespace scan: pass
- protected/generated/raw artifact path check: pass; no protected or generated hits, no disallowed raw artifacts
- targeted secret scan: pass
- staged artifact check: pass; no staged ZIPs, raw media, extracted inputs, or static artifacts
- Azure resources created: no
- Cloudflare DNS changed: no
- CMS writes: no
- static generation: no
- deployment: no

## Acceptance

- Architecture report exists.
- Architecture folder exists.
- Azure Static Web App plan exists.
- Cosmos DB production data plan exists.
- Azure Blob media plan exists.
- Cloudflare DNS/CDN plan exists.
- Media URL contract exists.
- MediaAsset production fields are documented.
- Publishing workflow exists.
- Contact form production plan exists.
- Rollback plan exists.
- No real secrets/connection strings committed.
- No Azure/Cloudflare/CMS/static/deploy actions performed.
- Roller remains paused.

## Next Recommended Action

Review and approve the production setup sequence, then authorize the next explicit gate: Azure/Cosmos/Blob setup planning or static-generation preflight, depending on launch order preference.
