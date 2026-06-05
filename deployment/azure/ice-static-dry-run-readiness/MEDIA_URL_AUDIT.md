# Media URL Audit

## Current Snapshot And Output

The approved three-page snapshot and generated static output still contain local-dev body/media URLs:

```text
/media/ice-rink-rentals/...
```

Strict validators no longer report unapproved rendered Open Graph/Twitter social image URLs under:

```text
https://iceskatingrinkrentals.com/media/...
```

Expected production media origin remains:

```text
https://media.iceskatingrinkrentals.com
```

The compact output scan did not detect `data:image` markers or `base64` image payload markers.

## Later MediaAsset Update Status

On 2026-06-05, the 9 approved Ice MediaAsset records were updated to production `media.iceskatingrinkrentals.com` URLs and read back successfully.

This did not clear the static output media errors because the remaining local URLs were embedded in CMS page body/media fields and revision snapshot fields. Page/body CMS work was not approved in the MediaAsset URL update run.

## Later Active Page Body Media Repair Status

On 2026-06-05, a separately approved run repaired only active root `ContentData` and root `media` URL fields on the three approved Ice pages.

Post-repair active root result:

| Page | Active `ContentData` local URLs | Active `media` local URLs | Revision snapshot local URLs |
| --- | ---: | ---: | ---: |
| `home` | 0 | 0 | 52 |
| `contact` | 0 | 0 | 50 |
| `service-areas` | 0 | 0 | 30 |

Rendered image tag result:

| File | Local `/media` img tags | Production media img tags |
| --- | ---: | ---: |
| `index.html` | 0 | 9 |
| `contact/index.html` | 0 | 7 |
| `service-areas/index.html` | 0 | 6 |

Strict validators still fail because the generated HTML/TXT serializes `revision.latestSnapshot` rollback payloads with pre-repair local media URLs. Manual stale revision/rollback snapshot editing was not approved in that run.

## Unapproved Rendered Social Image URL

Previous strict validators reported one unique unapproved rendered social image URL:

```text
https://iceskatingrinkrentals.com/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png
```

Previous occurrences:

| Route | Rendered files | Metadata fields |
| --- | --- | --- |
| `/` | `apps/ice-rink-web/out/index.html`, `apps/ice-rink-web/out/index.txt` | Open Graph image and Twitter image |
| `/service-areas` | `apps/ice-rink-web/out/service-areas/index.html`, `apps/ice-rink-web/out/service-areas/index.txt` | Open Graph image and Twitter image |

Source:

- `home` `page.seo.openGraph.og:image`
- `home` `page.seo.twitterCard.twitter:image`
- `service-areas` `page.seo.openGraph.og:image`
- `service-areas` `page.seo.twitterCard.twitter:image`

Before the CMS metadata repair, each source field contained the local value:

```text
/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png
```

`apps/ice-rink-web/src/lib/metadata.ts` converts relative Open Graph/Twitter image paths to absolute URLs with the site canonical domain. That produces `https://iceskatingrinkrentals.com/media/...`, which is still not the approved production media origin.

The approved active CMS metadata repair cleared those four source fields on `home` and `service-areas`. The post-repair static output no longer contains that unapproved rendered social image URL.

This does not claim media production readiness. Local body/media image URLs still remain in rendered page content.

## Local Media URL Summary

Unique local `/media/ice-rink-rentals/...` URL counts in fresh static output:

| Route | Unique local media URLs | Rendered files |
| --- | ---: | --- |
| `/` | 6 | `index.html`, `index.txt` |
| `/contact` | 8 | `contact/index.html`, `contact/index.txt` |
| `/service-areas` | 6 | `service-areas/index.html`, `service-areas/index.txt` |

The CMS source paths are page media objects and block media objects such as `page.media.*.publicUrl`, `page.media.*.url`, and `page.ContentData.ContentBlocks[*].content.*.media.publicUrl/url`. The renderer path is `apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx`, which reads `publicUrl`/`url` and emits `<img src=...>`.

Detailed route/source mapping is recorded in:

```text
deployment/azure/ice-static-dry-run-readiness/BODY_MEDIA_URL_BLOCKER_AUDIT.md
```

The earlier remaining local media URLs mapped to active page body/media fields and media objects with Ice `mediaAssetId` values. Those active root fields are now repaired. The remaining strict media failures map to serialized rollback snapshot payloads, not active rendered image tags.

## Policy Result

Local body/media URL problems do not block the local route-shape proof. They do block production media readiness, Azure staging readiness, and production deployment readiness.

## Readiness

Active page body media URL readiness: yes.

MediaAsset production URL readiness: yes after the later approved 2026-06-05 update.

Full media production URL readiness: no until the rollback snapshot/static output local media strings are cleared or filtered through a separately approved path and strict validators pass.
