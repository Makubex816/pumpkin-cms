# Party Pros Preview Route Discovery

Discovery scope: `apps/starter-app` source and the existing Party Pros compiled package path.

Starter site routes:

| Source | Finding |
| --- | --- |
| `apps/starter-app/src/app/(site)/page.tsx` | Home renders `fetchPumpkinPage('home')` when available, otherwise bundled `fallbackHomePage`. |
| `apps/starter-app/src/app/(site)/[...slug]/page.tsx` | Slug routes render `fetchPumpkinPage(slug)` and call `notFound()` when no published page is returned. |
| `apps/starter-app/src/lib/pumpkin-api.ts` | Runtime fetches `/api/pages/{tenantId}/{slug}`, `/api/themes/{tenantId}`, and `/api/forms/{tenantId}/definitions/{type}` using an authenticated request with the configured tenant API key. |
| `apps/starter-app/src/lib/tenant-config.ts` | Production config requires `PUMPKIN_TENANT_ID`, `NEXT_PUBLIC_PUMPKIN_API_URL` or `PUMPKIN_API_URL`, and `PUMPKIN_API_KEY`. Missing config returns `null`. |
| `apps/starter-app/content/` | Contains bundled Pumpkin fallback content only: `pumpkin-home-page.json` and `contact-form-definition.json`. |

Unsupported route types:

- No Party Pros static fixture route was found.
- No compiled-package preview adapter was found.
- No read-only unpublished page preview route was found.
- No route was found that can preview Party Pros home/contact/service-areas without tenant binding, a tenant API key, page publication, or source changes.

Compiled package presence:

- Path: `C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\PartyPros\v2-8-61ob-compiled-package-proof\compiled-package`
- Pages present: `pages/home.json`, `pages/contact.json`, `pages/service-areas.json`
- FormDefinition present: `form-definitions/party-pros-quote-request.json`
- Theme present: `theme.json`

The package exists, but the starter host does not have a source-supported path to render it read-only.
