# Pumpkin Static Export Publishing Phase 5B Report

## Executive Summary

Phase 5B added the Option C static-first publishing foundation for `apps/ice-rink-web`.

The frontend now supports two render modes:

- runtime CMS mode for local preview/admin testing
- static export mode for SITE_KEY-driven static builds

Static mode can validate and build separate Ice and Roller site outputs from controlled Page JSON seed content. No Azure deployment, Cloudflare purge, hard delete, drag-and-drop, CSV/XLSX changes, `.env.local` changes, or `appsettings.Development.json` changes were made.

## Files Changed

- `apps/ice-rink-web/.gitignore`
  - Ignores generated `.static-content` and `.static-artifacts`.
- `apps/ice-rink-web/next.config.js`
  - Adds conditional static export config when `PUMPKIN_RENDER_MODE=static`.
- `apps/ice-rink-web/package.json`
  - Adds static validation/build/export scripts.
  - Adds `cross-env` for Windows-compatible environment flags.
- `apps/ice-rink-web/scripts/static-publish.mjs`
  - Adds static validation and sitemap/robots/output snapshot generation.
- `apps/ice-rink-web/src/lib/render-mode.ts`
  - Central render mode and static env helpers.
- `apps/ice-rink-web/src/lib/static-content.ts`
  - Filesystem loader for static Page/Theme JSON.
- `apps/ice-rink-web/src/lib/content-source.ts`
  - Switches page/theme/sitemap reads between Pumpkin API and static JSON.
- `apps/ice-rink-web/src/lib/static-artifacts.ts`
  - Shared sitemap/robots generators.
- `apps/ice-rink-web/src/lib/resolve-site.ts`
  - Resolves by `SITE_KEY` in static mode and by host in runtime mode.
- `apps/ice-rink-web/src/config/sites.ts`
  - Adds site-key lookup and static site resolution.
- `apps/ice-rink-web/src/app/page.tsx`
  - Uses render-mode-aware page/theme loading.
- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
  - Adds static params only in static mode.
- `apps/ice-rink-web/src/app/layout.tsx`
  - Uses render-mode-aware theme loading.
- `apps/ice-rink-web/src/app/sitemap.xml/route.ts`
  - Uses render-mode-aware sitemap data.
- `apps/ice-rink-web/src/app/robots.txt/route.ts`
  - Adds robots.txt generation.
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
  - Adds static-compatible contact form behavior.
- `apps/ice-rink-web/src/lib/metadata.ts`
  - Preserves Page SEO canonical URL when present.

## Render Mode Design

Runtime CMS mode remains the default.

Runtime mode:

- `PUMPKIN_RENDER_MODE` unset or not `static`
- host header resolves the tenant/site
- pages/themes/sitemap data come from Pumpkin API
- `/api/contact` remains available for Next runtime deployments
- local multi-site preview remains compatible with:
  - `localhost:3002`
  - `roller.localhost:3002`

Static mode:

- `PUMPKIN_RENDER_MODE=static`
- `SITE_KEY` or `STATIC_SITE_KEY` selects the site
- no request-time hostname dependency for page generation
- page/theme/sitemap content comes from local Page JSON
- `next.config.js` uses `output: "export"`, `trailingSlash: true`, and `images.unoptimized: true`

## Static Content Source

Current source:

- `tools/ice-rink-local-seed/seed-sites/{SITE_KEY}/pages/*.json`
- `tools/ice-rink-local-seed/seed-sites/{SITE_KEY}/theme.json`

This keeps Phase 5B aligned with the known local seed/import content shape and avoids introducing a second Page schema.

Supported sites:

- `ice-rink-rentals`
- `roller-rink-rentals`

The loader preserves the full Page document shape loaded from JSON.

## Static Build Scripts

Added scripts:

- `npm run validate:static`
  - Generic validation command; requires `SITE_KEY` or `STATIC_SITE_KEY`.
- `npm run validate:static:ice`
- `npm run validate:static:roller`
- `npm run build:static:ice`
- `npm run build:static:roller`
- `npm run export:static:ice`
- `npm run export:static:roller`

The `export:static:*` scripts:

1. validate the selected site content
2. run the static Next build
3. generate sitemap/robots/manifest artifacts
4. copy the generated `out` folder into ignored site-specific snapshots:
   - `.static-artifacts/ice-rink-rentals/out`
   - `.static-artifacts/roller-rink-rentals/out`

## Static Routes

Static mode generated these public routes.

Ice:

- `/`
- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

Roller:

- `/`
- `/roller-rink-rentals`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

## Static Sitemap And Robots

Static sitemap/robots are generated two ways:

- by Next route handlers during static export
- by `scripts/static-publish.mjs generate` into the static output snapshot

Verified canonical sitemap domains:

- Ice: `https://iceskatingrinkrentals.com`
- Roller: `https://rollerrinkrentals.com`

`robots.txt` includes:

- `User-agent: *`
- `Allow: /`
- site-specific sitemap URL

## Form Strategy For Static Mode

Runtime mode still posts contact forms to `/api/contact`.

Static mode cannot rely on Next API routes at runtime. Phase 5B therefore adds a safe placeholder strategy:

- If `STATIC_FORM_ACTION` or `NEXT_PUBLIC_STATIC_FORM_ACTION` is configured, static forms post JSON to that endpoint.
- If no static form endpoint is configured, the form shows an error instead of pretending the submission succeeded.

Recommended future static form endpoints:

- Azure Function
- managed form endpoint
- future public Pumpkin form endpoint designed for static sites

The existing `apps/ice-rink-web/src/app/api/contact/route.ts` was not removed.

## Checks Run

Passed:

- `npm run type-check` from `apps/ice-rink-web`
- `npm run lint` from `apps/ice-rink-web`
- `npm run build` from `apps/ice-rink-web`
- `npm run validate:static:ice`
- `npm run validate:static:roller`
- `npm run build:static:ice`
- `npm run build:static:roller`
- `npm run export:static:ice`
- `npm run export:static:roller`

Static validation results:

- Ice: 4 pages, 4 published, 4 in sitemap
- Roller: 3 pages, 3 published, 3 in sitemap

Static output spot checks passed:

- Ice output contains `/ice-rink-rentals`, `/contact`, `/sitemap.xml`, and `/robots.txt`.
- Roller output contains `/roller-rink-rentals`, `/contact`, `/sitemap.xml`, and `/robots.txt`.
- Static snapshots do not include `/api/contact`, as expected for static hosting.

## Does True Next Export Work Now?

Yes, for the public static site outputs.

`next build` with `PUMPKIN_RENDER_MODE=static` and a selected `SITE_KEY` produces an `out` directory. The `export:static:*` scripts then copy the result into site-specific ignored snapshots.

Important note:

- Next still lists `/api/contact` as a dynamic route during build analysis because the runtime API route remains in the app.
- The exported static `out` snapshots do not include `/api/contact`.
- Static contact submissions must use a separate configured endpoint.

## Azure Readiness Notes

The generated static snapshots are suitable as the input shape for:

- Azure Static Web Apps
- Azure Storage static website hosting
- Azure CDN / Front Door in a later phase

Still needed before deployment automation:

- choose the Azure hosting target
- define one output artifact per domain
- configure custom domains and TLS
- configure static form endpoint
- add deployment workflow with validation gates

## Cloudflare Notes

No Cloudflare purge was implemented.

Future Cloudflare work should happen after Azure target selection:

- map each tenant/domain to its Cloudflare zone
- purge only after static upload succeeds
- keep purge credentials outside source control
- record deployment and purge results in an admin publishing log

## Known Limitations

- Static content currently reads from local seed-site JSON, not live Cosmos exports.
- No admin publish button triggers build/deploy yet.
- No Azure upload or Cloudflare purge.
- Static form endpoint is not implemented.
- No asset manifest or media copy pipeline yet.
- Static snapshots are generated locally under ignored `.static-artifacts`.
- The current setup should be run one site at a time because `next build` writes to the shared `out` directory before the script snapshots it.

## Next Recommended Phase

Recommended next phase: Static Publishing Pipeline Design/Implementation.

Suggested scope:

- add an admin-side publish action or CLI command that exports validated tenant Page JSON
- build one selected tenant statically
- package the site-specific output artifact
- prepare Azure upload integration
- add deployment logs and status reporting
- add Cloudflare purge only after Azure upload is proven
