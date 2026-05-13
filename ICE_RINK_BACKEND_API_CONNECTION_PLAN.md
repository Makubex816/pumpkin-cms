# Ice Rink Backend API Connection Plan

## Summary

`apps/ice-rink-web` is ready to connect to real Pumpkin CMS data once the Pumpkin API is running at `http://localhost:5064` and Cosmos DB contains an active `ice-rink-rentals` tenant, a matching BCrypt API key hash, one active theme, and at least one published `home` page.

The practical local backend path is Cosmos DB, either the Azure Cosmos DB Emulator or an Azure Cosmos DB account. MongoDB is present in configuration, but the current code throws unless `MongoDB.Driver` and the `USE_MONGODB` compilation symbol are added, so MongoDB is not the no-code option for this connection pass.

## API Run Steps

Prerequisites:

- .NET SDK `10.0.100`, matching `global.json`.
- Cosmos DB Emulator or an Azure Cosmos DB account.
- `apps/pumpkin-api/appsettings.Development.json` with local secrets.

Run the API:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\apps\pumpkin-api"
dotnet run
```

Expected local API URL:

```text
http://localhost:5064
```

Development Swagger UI:

```text
http://localhost:5064/swagger
```

Notes:

- `apps/pumpkin-api/Properties/launchSettings.json` defines the HTTP profile at `http://localhost:5064`.
- The API project targets `net10.0`.
- The root README still references .NET 9 and older ports, so use `launchSettings.json` as the source of truth.

## appsettings.Development.json Example

Create this file locally:

```text
apps/pumpkin-api/appsettings.Development.json
```

Example:

```json
{
  "Jwt": {
    "Issuer": "pumpkin-cms-api",
    "Audience": "pumpkin-cms-admin",
    "SecretKey": "local-dev-secret-at-least-32-characters-long",
    "ExpirationMinutes": 480
  },
  "Database": {
    "Provider": "CosmosDb",
    "CosmosDb": {
      "ConnectionString": "AccountEndpoint=https://localhost:8081/;AccountKey=<copy-from-cosmos-emulator-or-azure>;",
      "DatabaseName": "PumpkinCMS",
      "MaxRetryAttemptsOnRateLimitedRequests": 9,
      "MaxRetryWaitTimeOnRateLimitedRequests": 30,
      "PreferredRegions": ""
    }
  }
}
```

Equivalent environment variable names:

```powershell
$env:Database__Provider = "CosmosDb"
$env:Database__CosmosDb__ConnectionString = "AccountEndpoint=https://localhost:8081/;AccountKey=<key>;"
$env:Database__CosmosDb__DatabaseName = "PumpkinCMS"
$env:Jwt__SecretKey = "local-dev-secret-at-least-32-characters-long"
```

## Database And Container Requirements

Create the database:

```text
PumpkinCMS
```

Create these Cosmos containers with partition key `/tenantId`:

```text
Tenant
Page
Theme
User
FormEntry
```

Important mismatches:

- Root README says `Pages`, but current code uses singular `Page`.
- `README-CosmosDB.md` mentions a `Content` container and `PumpkinCMS-Dev`; current API code uses typed containers and defaults to `PumpkinCMS`.
- There is no current migration or auto-create-container flow. Missing database or containers will fail at runtime.

## Seed Data Requirements

Bootstrap order:

1. Generate a plain API key and BCrypt hash.
2. Insert the `ice-rink-rentals` tenant into `Tenant`.
3. Insert an active theme into `Theme`.
4. Insert a published `home` page into `Page`.
5. Optionally insert an admin user into `User`.

The first bootstrap is easiest through Cosmos Data Explorer because creating tenants/themes through the admin API requires a working admin user and JWT.

### API Key Generation

Use the existing utility:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\apps\pumpkin-api.Tests"
dotnet run
```

It prints:

- A plain API key.
- A BCrypt hash for the API key.
- Example tenant JSON.
- Example user JSON.

Current limitation: the utility is hard-coded for an `admin` tenant. For this seed pass, run it and adapt the generated values manually:

- Keep the plain API key for `ICE_RINK_RENTALS_API_KEY`.
- Store only the BCrypt hash in `Tenant.apiKeyHash`.
- Change `tenantId`, `id`, and `name` in the inserted tenant document to `ice-rink-rentals`.

### Tenant Document

Minimum shape for the `Tenant` container:

```json
{
  "id": "ice-rink-rentals",
  "tenantId": "ice-rink-rentals",
  "name": "Ice Skating Rink Rentals",
  "plan": "local-dev",
  "status": "active",
  "apiKey": "",
  "apiKeyHash": "<bcrypt-hash-from-generator>",
  "apiKeyMeta": {
    "createdAt": "2026-05-13T00:00:00Z",
    "isActive": true
  },
  "createdAt": "2026-05-13T00:00:00Z",
  "updatedAt": "2026-05-13T00:00:00Z",
  "settings": {
    "theme": "ice-rink-rentals-default",
    "language": "en-us",
    "maxUsers": 5,
    "features": {
      "forms": true,
      "pages": true,
      "analytics": false,
      "canCreateTenants": false,
      "canDeleteTenants": false,
      "canManageAllContent": false,
      "canViewAllTenants": false
    },
    "allowedOrigins": [
      "http://localhost:3002",
      "http://127.0.0.1:3002",
      "http://localhost:3000"
    ]
  },
  "contact": {
    "email": "",
    "phone": ""
  },
  "billing": {
    "cycle": "none",
    "nextInvoice": null
  }
}
```

### Active Theme Document

Minimum shape for the `Theme` container:

```json
{
  "id": "ice-rink-rentals-default",
  "themeId": "ice-rink-rentals-default",
  "tenantId": "ice-rink-rentals",
  "name": "Ice Rink Rentals Default",
  "description": "Local development theme for Ice Skating Rink Rentals",
  "isActive": true,
  "header": {
    "logoUrl": "",
    "logoAlt": "Ice Skating Rink Rentals",
    "sticky": true,
    "ctaText": "Get a Quote",
    "ctaUrl": "/contact",
    "ctaTarget": "_self",
    "classNames": {}
  },
  "footer": {
    "copyright": "Copyright 2026 Ice Skating Rink Rentals",
    "description": "Portable ice rink rental planning for events, schools, towns, corporate parties, and holiday activations.",
    "classNames": {}
  },
  "blockStyles": {},
  "menu": [
    { "label": "Rentals", "url": "/ice-rink-rentals", "target": "_self", "icon": "", "order": 1, "isVisible": true, "children": [] },
    { "label": "Events", "url": "/events-holiday-activations", "target": "_self", "icon": "", "order": 2, "isVisible": true, "children": [] },
    { "label": "Contact", "url": "/contact", "target": "_self", "icon": "", "order": 3, "isVisible": true, "children": [] }
  ],
  "createdAt": "2026-05-13T00:00:00Z",
  "updatedAt": "2026-05-13T00:00:00Z"
}
```

For a closer visual match, copy the richer theme settings from `apps/ice-rink-web/src/data/fallback-theme.ts` and convert them to JSON, keeping `tenantId`, `id`, `themeId`, and `isActive` as above.

### Published Home Page Document

Minimum shape for the `Page` container:

```json
{
  "id": "ice-rink-rentals-home",
  "PageId": "ice-rink-rentals-home",
  "tenantId": "ice-rink-rentals",
  "pageSlug": "home",
  "PageVersion": 1,
  "Layout": "default",
  "MetaData": {
    "category": "Rentals",
    "product": "portable ice rink",
    "keyword": "portable ice rink rentals",
    "pageType": "Home",
    "title": "Portable Ice Rink Rentals for Events",
    "description": "Portable ice rink rentals for events, schools, towns, corporate parties, and holiday activations.",
    "createdAt": "2026-05-13T00:00:00Z",
    "updatedAt": "2026-05-13T00:00:00Z",
    "author": "Pumpkin CMS",
    "language": "en-us",
    "market": "US"
  },
  "searchData": {
    "state": "",
    "city": "",
    "metro": "",
    "county": "",
    "keyword": "portable ice rink rentals",
    "tags": ["ice rink rentals", "portable ice rink", "holiday activations"],
    "contentSummary": "Portable ice rink rental planning and quote support.",
    "blockTypes": ["Hero", "TrustBar", "CardGrid", "HowItWorks", "FAQ", "PrimaryCTA"]
  },
  "ContentData": {
    "ContentBlocks": [
      {
        "type": "Hero",
        "content": {
          "type": "Main",
          "headline": "CMS LIVE: Portable Ice Rink Rentals for Events",
          "subheadline": "Portable rink rentals for events, schools, towns, corporate parties, and holiday activations.",
          "backgroundImage": "",
          "backgroundImageAltText": "",
          "mainImage": "",
          "mainImageAltText": "",
          "buttonText": "Get a Quote",
          "buttonLink": "/contact"
        }
      }
    ]
  },
  "contentRelationships": {
    "isHub": false,
    "hubPageSlug": "",
    "topicCluster": "ice-rink-rentals",
    "relatedHubs": [],
    "spokePriority": 0
  },
  "seo": {
    "metaTitle": "Portable Ice Rink Rentals for Events",
    "metaDescription": "Portable ice rink rentals for events, schools, towns, corporate parties, and holiday activations.",
    "keywords": ["portable ice rink rentals", "ice rink rentals"],
    "robots": "index, follow",
    "canonicalUrl": "https://iceskatingrinkrentals.com/",
    "alternateUrls": [],
    "structuredData": [],
    "openGraph": {
      "og:title": "Portable Ice Rink Rentals for Events",
      "og:description": "Portable ice rink rentals for events, schools, towns, corporate parties, and holiday activations.",
      "og:type": "website",
      "og:url": "https://iceskatingrinkrentals.com/",
      "og:image": "",
      "og:image:alt": "",
      "og:site_name": "Ice Skating Rink Rentals",
      "og:locale": "en_US"
    },
    "twitterCard": {
      "twitter:card": "summary_large_image",
      "twitter:title": "Portable Ice Rink Rentals for Events",
      "twitter:description": "Portable ice rink rentals for events, schools, towns, corporate parties, and holiday activations.",
      "twitter:image": "",
      "twitter:site": "",
      "twitter:creator": ""
    }
  },
  "isPublished": true,
  "publishedAt": "2026-05-13T00:00:00Z",
  "includeInSitemap": true
}
```

The `CMS LIVE:` marker is intentional for first connection testing. Remove it after confirming `apps/ice-rink-web` is rendering CMS data instead of fallback data.

### Optional Admin User

Use the same test utility output and insert into the `User` container. For an ice-rink tenant admin, adapt:

- `tenantId`: `ice-rink-rentals`
- `email`: for example `admin@iceskatingrinkrentals.com`
- `role`: `1` for `TenantAdmin`, or `0` for `SuperAdmin` if a bootstrap superadmin is needed.
- `isActive`: `true`

The generated password hash is independent of tenant ID, so changing `tenantId` in the JSON does not invalidate the password hash.

## Frontend .env.local Values

Create or update:

```text
apps/ice-rink-web/.env.local
```

Values:

```env
PUMPKIN_API_URL=http://localhost:5064

ICE_RINK_RENTALS_TENANT_ID=ice-rink-rentals
ICE_RINK_RENTALS_API_KEY=<plain-api-key-from-generator>
ICE_RINK_RENTALS_CANONICAL_URL=https://iceskatingrinkrentals.com

SECOND_PRODUCT_TENANT_ID=second-product-rentals
SECOND_PRODUCT_API_KEY=
SECOND_PRODUCT_CANONICAL_URL=https://second-domain-placeholder.com
```

Restart the Next.js dev server after changing `.env.local`.

## PowerShell Test Commands

Set variables:

```powershell
$api = "http://localhost:5064"
$tenantId = "ice-rink-rentals"
$apiKey = "<plain-api-key-from-generator>"
$headers = @{ Authorization = "Bearer $apiKey"; Accept = "application/json" }
```

Check the API root:

```powershell
Invoke-RestMethod -Uri "$api/"
```

Fetch the published home page:

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/home" -Headers $headers |
  ConvertTo-Json -Depth 50
```

Fetch the active theme:

```powershell
Invoke-RestMethod -Uri "$api/api/themes/$tenantId" -Headers $headers |
  ConvertTo-Json -Depth 50
```

Fetch sitemap entries:

```powershell
Invoke-RestMethod -Uri "$api/api/tenant/$tenantId/sitemap" -Headers $headers |
  ConvertTo-Json -Depth 20
```

Optional login test:

```powershell
$loginBody = @{
  email = "admin@iceskatingrinkrentals.com"
  password = "<plain-admin-password>"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "$api/api/auth/login" `
  -ContentType "application/json" `
  -Body $loginBody
```

Expected manual endpoint results:

- `/api/pages/ice-rink-rentals/home` returns `200 OK` and a page with `tenantId: "ice-rink-rentals"`, `pageSlug: "home"`, and `isPublished: true`.
- `/api/themes/ice-rink-rentals` returns `200 OK` and one `isActive: true` theme.
- `/api/tenant/ice-rink-rentals/sitemap` returns `200 OK` with `pages` containing `home`.

## Confirming ice-rink-web Uses CMS Data

1. Keep the seed home page headline marker as `CMS LIVE: Portable Ice Rink Rentals for Events`.
2. Start or restart the API on `http://localhost:5064`.
3. Start or restart the frontend:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\apps\ice-rink-web"
npm run dev
```

4. Open:

```text
http://localhost:3002/
```

Success criteria:

- The homepage shows the `CMS LIVE:` headline from Cosmos.
- The frontend console no longer shows `ECONNREFUSED` for `localhost:5064`.
- The frontend still renders fallback content only when the API is stopped, credentials are missing, or the CMS page is not found.
- `http://localhost:3002/sitemap.xml` includes CMS sitemap output when the API succeeds.

## Blockers And Questions For Repo Owner

- Confirm whether local development should officially target .NET 10 now, since code uses `net10.0` but root README says .NET 9.
- Confirm whether `http://localhost:5064` is the canonical local API URL. Some docs still mention `localhost:5000`, `https://localhost:5001`, or older Cosmos examples.
- Confirm the canonical database/container list. Code uses `Tenant`, `Page`, `Theme`, `User`, and `FormEntry`; docs mention stale `Pages` and `Content` names.
- Confirm whether a seed script should be added. Manual Data Explorer seeding is workable but fragile.
- Decide whether the API key/user generator should accept tenant/user arguments instead of being hard-coded to `admin`.
- Confirm desired admin bootstrap path: manual Cosmos insert, seed command, or protected setup endpoint.
- Confirm slug strategy. API routes allow catch-all slugs, but `Page.PageSlug` normalizes slashes to hyphens.
- Confirm whether enhanced hero fields used by the ice-rink fallback should become first-class CMS fields. The current C# `HeroContent` only stores `headline`, `subheadline`, images, and one button.
- Confirm media hosting for CMS images, OG images, and galleries.
- Confirm whether contact forms should be wired through `/api/forms/{tenantId}/entries` for the first CMS-backed MVP.

## Next Recommended Step

Add a small, uncommitted local seed JSON bundle or a proper seed command for `ice-rink-rentals`, then run the PowerShell endpoint tests above. Once the CMS home page renders in `apps/ice-rink-web`, repeat the seed process for the three MVP slugs: `ice-rink-rentals`, `events-holiday-activations`, and `contact`.
