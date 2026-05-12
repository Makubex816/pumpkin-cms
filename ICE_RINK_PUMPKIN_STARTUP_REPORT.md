# IceSkatingRinkRentals.com Pumpkin CMS Startup Report

## Executive summary

Pumpkin CMS is a reasonable foundation for IceSkatingRinkRentals.com and for a reusable multi-site frontend. The strongest starting point is `apps/sample-app`: it already fetches published pages and themes from the Pumpkin API, renders CMS blocks through `pumpkin-block-views`, maps CMS SEO fields into Next.js metadata, and has fallback content for local development.

The main implementation work for `apps/ice-rink-web` should be a thin, server-side multi-site layer around the sample app pattern: resolve the current host to a `tenantId`, API key, canonical domain, fallback theme, and optional brand settings, then fetch Pumpkin pages by `tenantId` and slug. The first MVP can mostly use existing block types. Custom ice-rink blocks should be added only where structured rental data matters, such as package comparison, availability/quote intake, venue requirements, and add-ons.

There are several startup blockers to clarify before implementation: docs disagree about .NET 9 vs .NET 10, local API ports differ between the API launch settings and sample app defaults, database container names in docs differ from code, there is no migration/seed flow, structured data exists but is not injected by the sample app, and slug handling is ambiguous for nested URL paths.

## Current repo structure

- `apps/pumpkin-api`: .NET minimal API for public content, themes, forms, auth, and admin endpoints.
- `apps/pumpkin-net-models`: shared C# models for pages, tenants, themes, users, forms, and polymorphic HTML blocks.
- `apps/pumpkin-api.Tests`: utility/test project that generates tenant API keys and user documents.
- `apps/sample-app`: Next.js 14 frontend that renders Pumpkin CMS pages with `pumpkin-block-views`.
- `apps/admin`: Next.js 14 admin interface for auth, tenant selection, pages, page relationships, block editing, themes, and SEO fields.
- `packages/pumpkin-ts-models`: TypeScript page, tenant, theme, user, and block models plus JSON conversion helpers.
- `packages/pumpkin-block-views`: React view components and `BlockViewRenderer` for supported CMS block types.
- Root and app-level README/docs: API setup, Cosmos configuration, deployment, database architecture, model docs, and sample/admin notes.

## Local setup steps

1. Install prerequisites:
   - .NET SDK `10.0.100` per `global.json`.
   - Node.js 18+ and npm.
   - Azure Cosmos DB Emulator or an Azure Cosmos DB account.

2. Configure the API:
   - Create `apps/pumpkin-api/appsettings.Development.json` because it is gitignored and not committed.
   - Set `Database:Provider`, `Database:CosmosDb:ConnectionString`, `Database:CosmosDb:DatabaseName`, and `Jwt:SecretKey`.
   - Use environment variables instead if preferred, for example `Database__CosmosDb__ConnectionString` and `Jwt__SecretKey`.

3. Prepare database data:
   - Create the expected database, usually `PumpkinCMS`.
   - Create containers/collections listed in the database notes below.
   - Seed at least one active `Tenant`, one `User` for admin login, one active `Theme`, and one published `Page`.
   - Use `apps/pumpkin-api.Tests` to generate a tenant API key hash and user password hash.

4. Run the API:
   ```bash
   cd apps/pumpkin-api
   dotnet run
   ```
   The current `launchSettings.json` uses `http://localhost:5064`.

5. Run the sample frontend:
   ```bash
   cd apps/sample-app
   npm install
   cp .env.example .env
   npm run dev
   ```
   Set `.env` to point at the API and tenant:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5064
   PUMPKIN_API_KEY=your-tenant-api-key
   PUMPKIN_TENANT_ID=your-tenant-id
   ```
   The sample app runs on `http://localhost:3001`.

6. Run the admin app if needed:
   ```bash
   cd apps/admin
   npm install
   cp .env.example .env
   npm run dev
   ```
   The admin defaults to `http://localhost:3000` and `NEXT_PUBLIC_API_URL=http://localhost:5064`.

## API startup notes

- The API project targets `net10.0`; the root README still says .NET 9.0.
- `appsettings.json` has safe placeholders. Local secrets belong in gitignored `appsettings.Development.json` or environment variables.
- `Program.cs` registers `HtmlBlockBaseJsonConverter` so incoming page JSON can deserialize polymorphic block types.
- Swagger is enabled only in development at `/swagger`.
- Public content endpoints use an API key in `Authorization: Bearer {apiKey}` and tenant-scoped CORS.
- Admin endpoints use JWT auth from `/api/auth/login`.
- `apps/admin/src/lib/api.ts` references `/api/auth/verify` and `/api/auth/logout`, but those endpoints are not visible in `Program.cs`.
- `TenantCorsPolicyProvider` builds CORS policies from `Tenant.settings.allowedOrigins` and caches them for `Cors:CacheMinutes` minutes.

## Frontend startup notes

- `apps/sample-app` is the best starting point for `apps/ice-rink-web`.
- It uses Next.js App Router, local file dependencies on `pumpkin-ts-models` and `pumpkin-block-views`, and `transpilePackages` for both packages.
- `src/lib/api.ts` fetches pages, themes, and sitemap entries with ISR revalidation.
- `src/app/page.tsx` fetches the `home` page and falls back to embedded sample data.
- `src/app/[...slug]/page.tsx` joins route segments with `/`, fetches that slug, and returns `notFound()` if the API returns nothing.
- `src/app/layout.tsx` fetches the active theme and renders theme-driven header/footer with a fallback Pumpkin theme.
- The sample app currently uses Pumpkin branding and a single tenant configured by environment variables.

## Database/config notes

Actual code expects these Cosmos containers, all effectively tenant-scoped with partition key `/tenantId` where item operations use a partition key:

- `Tenant`
- `Page`
- `Theme`
- `User`
- `FormEntry`

Important doc/code mismatches:

- Root README says containers `Tenant` and `Pages`, but code uses singular `Page`.
- `README-CosmosDB.md` mentions a `Content` container, but the current API uses typed containers such as `Page`, `Tenant`, `Theme`, `User`, and `FormEntry`.
- Some docs mention `PumpkinCMS-Dev`; current committed config defaults to `PumpkinCMS`.
- There is no apparent migration or auto-create-container step. Local setup must create containers manually or through a separate script.
- MongoDB is configured as an option, but the project does not include `MongoDB.Driver` or define `USE_MONGODB`, so Cosmos DB is the practical local provider right now.

Required local configuration:

- API: `Database:Provider`, `Database:CosmosDb:ConnectionString`, `Database:CosmosDb:DatabaseName`, `Jwt:SecretKey`.
- Sample frontend: `NEXT_PUBLIC_API_URL`, `PUMPKIN_API_KEY`, `PUMPKIN_TENANT_ID`.
- Admin frontend: `NEXT_PUBLIC_API_URL`; `NEXT_PUBLIC_API_KEY` is included in the admin client as `X-API-Key`, but admin routes primarily use JWT.
- Tenant documents need `status: "active"`, `apiKeyHash`, `apiKeyMeta.isActive: true`, and `settings.allowedOrigins` that include local frontend origins.

## Tenant/page-fetching notes

- Public page route: `GET /api/pages/{tenantId}/{**pageSlug}`.
- Public theme routes: `GET /api/themes/{tenantId}` and `GET /api/themes/{tenantId}/{themeId}`.
- Public sitemap route: `GET /api/tenant/{tenantId}/sitemap`.
- The API extracts a Bearer API key, URI-decodes `pageSlug`, validates required params, then calls `IDatabaseService.GetPageAsync(apiKey, tenantId, pageSlug)`.
- Cosmos validates the API key by querying `Tenant` where `tenantId` matches, `status` is `active`, and `apiKeyMeta.isActive` is true, then verifies the supplied key against `apiKeyHash` with BCrypt.
- Published page fetch queries the `Page` container with `tenantId`, `pageSlug`, and `isPublished = true`, using `tenantId` as the partition key.
- Admin page fetches can include drafts through JWT-protected `/api/admin/pages` and `/api/admin/pages/{tenantId}/{**pageSlug}`.
- `tenantId` is also stored on `Page`, `Theme`, `Tenant`, `User`, and `FormEntry`, and is carried in JWT claims for admin authorization.

Slug caution:

- The API route and sample app support catch-all slugs with `/`.
- The C# `Page.PageSlug` setter and TypeScript `PageJsonConverter.normalizeSlug()` replace slashes with hyphens.
- The sample app does not run `PageJsonConverter` on API responses and the API fetch path only lowercases the requested slug.
- Before building many location or service URLs, confirm whether canonical page slugs should be nested paths like `locations/new-york` or flat slugs like `locations-new-york`.

## Block-rendering notes

Supported block types across current TypeScript models, C# factory, admin defaults, and block views:

- `Hero`
- `PrimaryCTA`
- `SecondaryCTA`
- `CardGrid`
- `FAQ`
- `Breadcrumbs`
- `TrustBar`
- `HowItWorks`
- `ServiceAreaMap`
- `LocalProTips`
- `Gallery`
- `Testimonials`
- `Contact`
- `Blog`

Rendering flow in the sample app:

1. `fetchPage(slug)` returns a `Page`.
2. `PageRenderer` filters out blocks where `enabled === false`.
3. Each block is wrapped in a `<section>` with a generated anchor id.
4. `BlockViewRenderer` switches on `block.type` and renders the matching React view.
5. Theme `blockStyles` are cast to `BlockClassNamesMap` and passed to the renderer.
6. Unknown block types render the provided fallback message.

Typing flow:

- .NET uses `HtmlBlockFactory` and `HtmlBlockBaseJsonConverter` for known block types, with generic fallback for unknown types.
- TypeScript exposes discriminated block interfaces and `SUPPORTED_BLOCK_TYPES`.
- Admin block editing uses block defaults and a switch-based field editor, with a raw JSON fallback for unknown blocks.
- Custom blocks should be added in C# models/factory, TypeScript models, admin defaults/editor, and `pumpkin-block-views` if they should be first-class CMS blocks.

Block-related caution:

- Data samples reference `HeroSecondary` and `HeroTertiary` as separate block types, but current supported types use one `Hero` block with `content.type` set to `Main`, `Secondary`, or `Tertiary`.

## SEO/rendering notes

- `Page.seo` includes meta title, meta description, keywords, robots, canonical URL, alternate URLs, structured data strings, Open Graph fields, and Twitter Card fields.
- `apps/sample-app/src/lib/metadata.ts` maps `Page.seo` and `Page.MetaData` into Next.js `Metadata`.
- The home route and dynamic slug route both implement `generateMetadata()`.
- `apps/sample-app/src/app/sitemap.xml/route.ts` fetches published sitemap entries from the API and emits XML.
- Admin page editing includes SEO fields and a structured data modal/editor.
- `StructuredData` exists in the sample app, but it is not currently imported or rendered by the page routes. JSON-LD will not be injected until that is wired in.
- `metadataBase` in the sample layout is hard-coded to `https://pumpkincms.dev`; `apps/ice-rink-web` should make this site-specific.

## Multi-site architecture recommendation

Create `apps/ice-rink-web` from the sample app pattern, but do not keep a single global `PUMPKIN_TENANT_ID`. Instead, resolve the site on the server from the request host.

Recommended approach:

- Keep API keys server-only by using non-`NEXT_PUBLIC` environment variables.
- Add a site registry that maps hostnames to `tenantId`, API key env var name, canonical URL, fallback theme, brand name, and optional feature flags.
- Resolve site config in server components/routes using `headers()` from Next.js.
- Pass the resolved site into `fetchPage(site, slug)`, `fetchTheme(site)`, and `fetchSitemapData(site)`.
- Keep `tenantId` as the CMS isolation key and hostname as the frontend routing key.
- Use one shared frontend app for multiple rental sites, with per-site theme and content coming from Pumpkin CMS.
- Keep custom ice-rink blocks app-local for the first prototype only if speed matters; promote them into shared packages once Steven/repo owner confirms the block schema.

## Suggested file tree for apps/ice-rink-web

```text
apps/ice-rink-web/
  package.json
  next.config.js
  tsconfig.json
  tailwind.config.js
  postcss.config.js
  .env.example
  src/
    app/
      globals.css
      layout.tsx
      page.tsx
      not-found.tsx
      [...slug]/
        page.tsx
      sitemap.xml/
        route.ts
    components/
      PageRenderer.tsx
      StructuredData.tsx
      SiteHeader.tsx
      SiteFooter.tsx
      blocks/
        RinkPackageComparisonBlock.tsx
        AvailabilityQuoteBlock.tsx
        VenueRequirementsBlock.tsx
        RentalAddOnsBlock.tsx
    config/
      sites.ts
      blockRegistry.ts
    data/
      fallback-home.ts
      fallback-theme.ts
    lib/
      pumpkin-api.ts
      resolve-site.ts
      metadata.ts
      urls.ts
```

Suggested `.env.example` shape:

```env
NEXT_PUBLIC_API_URL=http://localhost:5064
ICE_RINK_RENTALS_TENANT_ID=ice-rink-rentals
ICE_RINK_RENTALS_API_KEY=your-api-key
ICE_RINK_RENTALS_CANONICAL_URL=https://iceskatingrinkrentals.com
```

For true multi-site reuse, add parallel env keys per site and map them in `src/config/sites.ts`.

## First 4-page MVP plan

1. Home: high-intent hero, trust bar, rental use cases, package teaser, how it works, testimonials, FAQ, and quote CTA.
2. Ice Rink Rentals: detailed rental packages, rink sizes, indoor/outdoor notes, add-ons, venue requirements, FAQ, and quote form.
3. Events and Holiday Activations: private parties, corporate events, city/town holiday markets, malls, schools, and parks, with gallery/testimonials.
4. Contact / Get a Quote: structured lead form, phone/email, service area, installation checklist, and expected response time.

Use simple slugs first until slug behavior is clarified:

- `home`
- `ice-rink-rentals`
- `events-holiday-activations`
- `contact`

## Recommended custom blocks

Use existing blocks for the first pass where possible:

- `Hero`, `TrustBar`, `CardGrid`, `HowItWorks`, `Gallery`, `Testimonials`, `FAQ`, `ServiceAreaMap`, `PrimaryCTA`, `SecondaryCTA`, and `Contact` cover most marketing needs.

Add these custom blocks when structured rental data becomes important:

- `RinkPackageComparison`: compares synthetic/portable rink packages, dimensions, event types, installation time, and starting price.
- `AvailabilityQuote`: lead form for event date, location, indoor/outdoor, surface type, guest count, rental duration, and add-ons.
- `VenueRequirements`: structured checklist for space, surface, power, access, permits, insurance, weather, and lead time.
- `RentalAddOns`: skates, attendants, lighting, music, barriers, holiday decor, branding, seating, and warming areas.
- `SeasonalAvailability`: holiday season windows, peak dates, booking urgency, and blackout messaging.
- `RinkSpecs`: dimensions, capacity, surface type, safety rails, operating temperature, and staffing recommendations.

## Open questions for Steven and the repo owner

- Is the official API target .NET 10 now, or should docs/project files be reconciled back to .NET 9?
- Should local API development use `http://localhost:5064`, `https://localhost:7211`, or both?
- What are the canonical Cosmos container names and partition keys for local development?
- Is there a preferred seed script or manual seed process for `Tenant`, `User`, `Theme`, and initial pages?
- Should public slugs support nested paths with `/`, or should all stored slugs be hyphen-only?
- Should each tenant represent one public website, or can one tenant contain multiple domains/sites?
- Where should custom domains and per-site canonical URLs live: tenant settings, theme, or frontend config?
- Should the sample/admin `NEXT_PUBLIC_API_KEY` pattern remain, given admin routes use JWT and public frontend API keys should stay server-only?
- Should `ContactBlock` submit to `/api/forms/{tenantId}/entries` in the frontend MVP?
- Should JSON-LD structured data be rendered by default in the sample/ice-rink app?
- Should custom blocks be app-local first, or added as first-class shared Pumpkin block types immediately?
- What is the intended media/asset hosting strategy for rink photos, OG images, and gallery assets?
- Who will provide final rental package data, pricing rules, service areas, insurance/permitting language, and legal disclaimers?

## Next recommended implementation step

Create `apps/ice-rink-web` by copying the sample app structure, then add only the multi-site config layer first: `sites.ts`, `resolve-site.ts`, and a site-aware Pumpkin API client. Keep the first MVP on existing block types and four simple slugs, then add app-local custom block renderers after Steven and the repo owner confirm slug rules, database seeding, and custom block ownership.
