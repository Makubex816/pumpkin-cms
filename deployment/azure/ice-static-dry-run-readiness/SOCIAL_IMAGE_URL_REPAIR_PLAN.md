# Social Image URL Repair Plan

Generated: 2026-06-04

## Scope

This is a read-only planning note for IceSkatingRinkRentals.com. No CMS records or MediaAsset records were changed.

## Current Strict Validator Finding

Strict validators report one unique unapproved rendered social image URL:

```text
https://iceskatingrinkrentals.com/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png
```

The approved production media origin is:

```text
https://media.iceskatingrinkrentals.com
```

## Current Active Source Fields

| Page slug | Route | Field | Current value | Rendered result |
| --- | --- | --- | --- | --- |
| `home` | `/` | `page.seo.openGraph.og:image` | `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png` | rendered as `https://iceskatingrinkrentals.com/media/...` |
| `home` | `/` | `page.seo.twitterCard.twitter:image` | `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png` | rendered as `https://iceskatingrinkrentals.com/media/...` |
| `contact` | `/contact` | `page.seo.openGraph.og:image` | empty | no rendered social image tag |
| `contact` | `/contact` | `page.seo.twitterCard.twitter:image` | empty | no rendered social image tag |
| `service-areas` | `/service-areas` | `page.seo.openGraph.og:image` | `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png` | rendered as `https://iceskatingrinkrentals.com/media/...` |
| `service-areas` | `/service-areas` | `page.seo.twitterCard.twitter:image` | `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png` | rendered as `https://iceskatingrinkrentals.com/media/...` |

Rendered files:

- `apps/ice-rink-web/out/index.html`
- `apps/ice-rink-web/out/index.txt`
- `apps/ice-rink-web/out/service-areas/index.html`
- `apps/ice-rink-web/out/service-areas/index.txt`

## Code Path

`apps/ice-rink-web/src/lib/metadata.ts` reads:

- `seo.openGraph['og:image']`
- `seo.twitterCard['twitter:image']`

The helper `absoluteUrl(...)` converts relative image paths to the site canonical domain. Therefore `/media/...` becomes `https://iceskatingrinkrentals.com/media/...`, which is still not the approved production media origin.

## Proposed Repair Options

### Option A: CMS metadata-only temporary clear

Safest immediate CMS repair once explicitly approved:

| Page slug | Field | From | To |
| --- | --- | --- | --- |
| `home` | `page.seo.openGraph.og:image` | local `/media/...` URL | empty or omitted |
| `home` | `page.seo.twitterCard.twitter:image` | local `/media/...` URL | empty or omitted |
| `service-areas` | `page.seo.openGraph.og:image` | local `/media/...` URL | empty or omitted |
| `service-areas` | `page.seo.twitterCard.twitter:image` | local `/media/...` URL | empty or omitted |

Do not change active `contact`; its social image fields are already empty.

This removes unapproved rendered social image tags without claiming media production readiness.

### Option B: Static metadata guard

Possible local tooling/application repair after explicit approval:

- update static metadata generation to omit Open Graph/Twitter image tags when the source value is local `/media/...`
- keep media production URL readiness as `no`
- keep body image blockers intact so production media readiness still fails until production media URLs exist

This avoids CMS metadata writes but changes app behavior and should be reviewed separately.

### Option C: Production media URL replacement

Final production repair after media infrastructure exists:

- publish approved image binary to the production media origin
- update MediaAsset/public URL records or active CMS SEO fields to `https://media.iceskatingrinkrentals.com/...`
- rerun export and strict validators

This requires separately authorized media infrastructure and MediaAsset/CMS work.

## Recommended Next Write Step

Request explicit approval to perform Option A only:

```text
Clear home and service-areas active page SEO social image fields:
page.seo.openGraph.og:image
page.seo.twitterCard.twitter:image
```

## Actions Not Performed

- no CMS write
- no MediaAsset write
- no media upload
- no Azure, DNS, Cloudflare, deployment, email, Microsoft 365, or Roller action
- no protected config access
