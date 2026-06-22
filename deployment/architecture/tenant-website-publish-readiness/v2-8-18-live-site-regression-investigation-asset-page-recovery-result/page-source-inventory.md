# Page Source Inventory

Current discovered public page source:

| Route | Source evidence | Image fields |
| --- | --- | --- |
| `/` | `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/home.json` and `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out/index.txt` | empty |
| `/service-areas` | `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/service-areas.json` and static output | empty |
| `/contact` | `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/contact.json` and static output | empty |

Current rendering source:

- `apps/ice-rink-web/src/app/page.tsx`
- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx`
- `apps/ice-rink-web/src/data/fallback-home.ts`
- `apps/ice-rink-web/src/data/fallback-pages.ts`

The renderer supports hero/media/card images when provided. The current page data does not provide them.

Worktree note: `apps/ice-rink-web/.gitignore`, `src/app/page.tsx`, `src/app/[...slug]/page.tsx`, and `src/components/PageRenderer.tsx` already had uncommitted modifications before this result package. V2.8.18 did not modify those files.

