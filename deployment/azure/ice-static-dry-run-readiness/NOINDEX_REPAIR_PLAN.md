# Noindex Repair Plan

Generated: 2026-06-04

## Scope

This is a read-only planning note for IceSkatingRinkRentals.com. No CMS records were changed.

## Evidence Source

Latest local CMS snapshot:

```text
apps/ice-rink-web/.static-content-snapshots/ice-rink-rentals/pages/
```

Rendered static output:

```text
apps/ice-rink-web/out/
```

Metadata render path:

1. `apps/ice-rink-web/src/app/page.tsx` loads `home` and calls `buildMetadata(...)`.
2. `apps/ice-rink-web/src/app/[...slug]/page.tsx` loads slug pages and calls `buildMetadata(...)`.
3. `apps/ice-rink-web/src/lib/metadata.ts` emits `robots: seo.robots || 'index, follow'`.

## Current Active Values

| Page slug | Route | Active source field | Current active value | Rendered result |
| --- | --- | --- | --- | --- |
| `home` | `/` | `page.seo.robots` | `noindex, nofollow` | `apps/ice-rink-web/out/index.html` renders `noindex, nofollow` |
| `contact` | `/contact` | `page.seo.robots` | `index,follow` | `apps/ice-rink-web/out/contact/index.html` renders `index,follow` |
| `service-areas` | `/service-areas` | `page.seo.robots` | `noindex, nofollow` | `apps/ice-rink-web/out/service-areas/index.html` renders `noindex, nofollow` |

## Revision Snapshot Note

`contact` active page metadata is already indexable. Its stale revision snapshot still contains:

```text
page.revision.latestSnapshot.page.seo.robots = noindex,nofollow
```

The active export uses `page.seo.robots`, not the stale revision value, so the contact revision snapshot should not be touched unless a separate revision-history cleanup is explicitly approved.

## Proposed CMS Repair

Requires explicit approval before any CMS write:

| Page slug | Field to update | From | To |
| --- | --- | --- | --- |
| `home` | `page.seo.robots` | `noindex, nofollow` | `index,follow` |
| `service-areas` | `page.seo.robots` | `noindex, nofollow` | `index,follow` |

No change is recommended for active `contact`:

```text
contact.page.seo.robots = index,follow
```

## Other Metadata

No other metadata field was found to be required to prevent noindex rendering. `includeInSitemap` is already true for all three approved pages.

## Verification After Approved Write

After explicit approval and CMS metadata update:

1. Rerun `cd apps/ice-rink-web && npm run export:static:ice:cms`.
2. Confirm route output is still exactly `/`, `/contact`, `/service-areas`.
3. Confirm no noindex meta appears in:
   - `apps/ice-rink-web/out/index.html`
   - `apps/ice-rink-web/out/service-areas/index.html`
4. Rerun strict validators and confirm noindex errors are gone.

## Actions Not Performed

- no CMS write
- no MediaAsset write
- no Azure, DNS, Cloudflare, deployment, email, Microsoft 365, or Roller action
- no protected config access
