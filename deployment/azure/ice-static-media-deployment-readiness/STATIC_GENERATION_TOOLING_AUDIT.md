# Static Generation Tooling Audit

## Existing Commands

`apps/ice-rink-web/package.json` includes:

- `npm run snapshot:cms:ice`
- `npm run validate:snapshot:ice`
- `npm run export:static:ice:cms`
- `npm run publish:dry-run:cms`
- `npm run validate:static:ice`
- `npm run export:static:ice`
- `npm run publish:dry-run`

## Static Render Mode

`apps/ice-rink-web/next.config.js` enables static export when `PUMPKIN_RENDER_MODE=static`:

- Next output switches to `export`.
- images are unoptimized for static output.
- local media proxy rewrites are disabled in static mode.

`apps/ice-rink-web/src/lib/content-source.ts` switches page/theme/sitemap reads from runtime API calls to static JSON snapshots when static render mode is active.

## CMS Snapshot Tool

`apps/ice-rink-web/scripts/snapshot-cms-content.mjs` writes generated CMS snapshots under:

```text
apps/ice-rink-web/.static-content-snapshots/ice-rink-rentals/
```

That snapshot command requires the Ice API key environment value. It can use an admin JWT for complete page discovery, but no JWT or secrets were loaded or printed during this audit.

## Current Blockers

- `apps/ice-rink-web/scripts/static-publish.mjs` still expects Ice slugs `home`, `ice-rink-rentals`, `events-holiday-activations`, and `contact`.
- `deployment/static-azure/scripts/static-publish-dry-run.mjs` still expects `/ice-rink-rentals` and `/events-holiday-activations`.
- `deployment/static-azure/validate-static-output.mjs` still expects generated folders `ice-rink-rentals` and `events-holiday-activations`.
- Existing ignored CMS snapshot content is stale, generated on 2026-05-24, and includes older routes instead of the current approved `/service-areas` set.
- Existing ignored static artifacts/out folders are stale and were not regenerated.

## Dry Run Decision

A static generation dry run was not run. It would create generated artifacts and, with current route expectations, would not be a trustworthy proof of the approved live CMS route set.

Ready for static generation dry run: no.

Required first fix: update static route expectations and validation to the approved live CMS route set, then run a fresh CMS snapshot/export in a separately authorized dry-run task.

