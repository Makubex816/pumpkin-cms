# Contact Source Inventory

Result: source inventory complete.

Reviewed frontend source:

- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx`
- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `apps/ice-rink-web/src/app/page.tsx`
- `apps/ice-rink-web/src/lib/render-mode.ts`
- `apps/ice-rink-web/src/lib/public-render-page.ts`
- `apps/ice-rink-web/src/data/ice-rink-recovered-pages.ts`
- `apps/ice-rink-web/src/config/sites.ts`

Reviewed API/function source:

- `apps/ice-rink-web/src/app/api/contact/route.ts`
- `deployment/static-azure/forms/static-form-endpoint/azure-function-static-contact.mjs`
- `deployment/static-azure/forms/static-form-endpoint/azure-function-adapter.mjs`
- `deployment/static-azure/forms/static-form-endpoint/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint/local-test-server.mjs`

Reviewed relevant docs/scripts:

- `apps/ice-rink-web/next.config.js`
- `apps/ice-rink-web/package.json`
- `apps/ice-rink-web/scripts/sanitized-static-build.mjs`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `deployment/static-azure/static-form-strategy.md`
- `deployment/static-azure/forms/static-form-endpoint/README.md`

Inventory result:

- Runtime Next mode has a source route for `/api/contact`.
- Static export mode is designed to use a public static endpoint URL instead.
- The deployable static endpoint scaffold is separate from the static frontend artifact.
- The production artifact did not carry a configured public static endpoint URL.
