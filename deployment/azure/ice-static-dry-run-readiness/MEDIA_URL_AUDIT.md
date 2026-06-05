# Media URL Audit

## Current Snapshot And Output

The approved three-page snapshot and generated static output no longer contain local-dev body/media URLs:

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

A later approved static revision-payload cleanup on 2026-06-05 removed `revision.latestSnapshot` from public static snapshot artifacts, clearing the remaining serialized rollback payload local media strings without editing CMS revisions.

Post-repair active root result:

| Page | Active `ContentData` local URLs | Active `media` local URLs | Public static `revision.latestSnapshot` payload |
| --- | ---: | ---: | ---: |
| `home` | 0 | 0 | omitted |
| `contact` | 0 | 0 | omitted |
| `service-areas` | 0 | 0 | omitted |

Rendered image tag result:

| File | Local `/media` img tags | Production media img tags |
| --- | ---: | ---: |
| `index.html` | 0 | 9 |
| `contact/index.html` | 0 | 7 |
| `service-areas/index.html` | 0 | 6 |

Strict validators no longer fail on media URLs. Manual stale revision/rollback snapshot editing was not performed.

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

This no longer blocks media production URL readiness.

## Local Media URL Summary

Unique local `/media/ice-rink-rentals/...` URL counts in fresh static output after the revision-payload cleanup:

| Route | Unique local media URLs | Rendered files |
| --- | ---: | --- |
| `/` | 0 | `index.html`, `index.txt` |
| `/contact` | 0 | `contact/index.html`, `contact/index.txt` |
| `/service-areas` | 0 | `service-areas/index.html`, `service-areas/index.txt` |

The CMS source paths are page media objects and block media objects such as `page.media.*.publicUrl`, `page.media.*.url`, and `page.ContentData.ContentBlocks[*].content.*.media.publicUrl/url`. The renderer path is `apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx`, which reads `publicUrl`/`url` and emits `<img src=...>`.

Detailed route/source mapping is recorded in:

```text
deployment/azure/ice-static-dry-run-readiness/BODY_MEDIA_URL_BLOCKER_AUDIT.md
```

The earlier remaining local media URLs mapped first to active page body/media fields, then to serialized rollback snapshot payloads after the active-root repair. Both are now cleared from public static output.

## Policy Result

Local body/media URL problems no longer block production media readiness. Form endpoint readiness still blocks static output quality gates, Azure staging readiness, and production deployment readiness.

## Readiness

Active page body media URL readiness: yes.

MediaAsset production URL readiness: yes after the later approved 2026-06-05 update.

Full media production URL readiness: yes after the later approved static revision-payload cleanup.
