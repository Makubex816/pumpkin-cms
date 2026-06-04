# Media URL Audit

## Current Snapshot And Output

The approved three-page snapshot and generated static output still contain local-dev media URLs:

```text
/media/ice-rink-rentals/...
```

Strict validators also report unapproved rendered image URLs under:

```text
https://iceskatingrinkrentals.com/media/...
```

Expected production media origin remains:

```text
https://media.iceskatingrinkrentals.com
```

The compact output scan did not detect `data:image` markers or `base64` image payload markers.

## Unapproved Rendered Image URL

Strict validators report one unique unapproved rendered image URL:

```text
https://iceskatingrinkrentals.com/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png
```

Occurrences:

| Route | Rendered files | Metadata fields |
| --- | --- | --- |
| `/` | `apps/ice-rink-web/out/index.html`, `apps/ice-rink-web/out/index.txt` | Open Graph image and Twitter image |
| `/service-areas` | `apps/ice-rink-web/out/service-areas/index.html`, `apps/ice-rink-web/out/service-areas/index.txt` | Open Graph image and Twitter image |

Source:

- `home` `page.seo.openGraph.og:image`
- `home` `page.seo.twitterCard.twitter:image`
- `service-areas` `page.seo.openGraph.og:image`
- `service-areas` `page.seo.twitterCard.twitter:image`

Each source field contains the local value:

```text
/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png
```

`apps/ice-rink-web/src/lib/metadata.ts` converts relative Open Graph/Twitter image paths to absolute URLs with the site canonical domain. That produces `https://iceskatingrinkrentals.com/media/...`, which is still not the approved production media origin.

This is expected local media placeholder behavior until production media URLs are published and recorded. It is a real production-readiness blocker.

## Local Media URL Summary

Unique local `/media/ice-rink-rentals/...` URL counts in fresh static output:

| Route | Unique local media URLs | Rendered files |
| --- | ---: | --- |
| `/` | 6 | `index.html`, `index.txt` |
| `/contact` | 8 | `contact/index.html`, `contact/index.txt` |
| `/service-areas` | 6 | `service-areas/index.html`, `service-areas/index.txt` |

The CMS source paths are page media objects and block media objects such as `page.media.*.publicUrl`, `page.media.*.url`, and `page.ContentData.ContentBlocks[*].content.*.media.publicUrl/url`. The renderer path is `apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx`, which reads `publicUrl`/`url` and emits `<img src=...>`.

## Policy Result

Media URL problems do not block the local route-shape proof. They do block production media readiness, Azure staging readiness, and production deployment readiness.

## Readiness

Media production URL readiness: no.

No MediaAsset records were updated and no media files were uploaded.
