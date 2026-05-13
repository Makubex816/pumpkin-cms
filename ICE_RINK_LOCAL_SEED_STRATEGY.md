# Ice Rink Local Seed Strategy

## Recommendation

Use manual Cosmos DB Data Explorer inserts for this first `ice-rink-rentals` seed. Reuse `apps/pumpkin-api.Tests` only to generate the plain API key, BCrypt API key hash, plain admin password, and BCrypt password hash.

This is safer than adding a write-capable seed command right now because:

- There is no migration or seed framework in the repo yet.
- The first bootstrap requires a tenant and optional admin user before admin APIs are useful.
- Manual insert avoids accidental upserts, deletes, or cross-tenant writes while the schema is still being confirmed.
- `apps/pumpkin-api.Tests` already generates correct BCrypt values and can be reused without source changes.

A small local-only seed helper would be practical later, but I would not implement it until the repo owner confirms the bootstrap path and casing conventions.

## Files And Models Reviewed

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/CosmosSystemTextJsonSerializer.cs`
- `apps/pumpkin-api.Tests/Program.cs`
- `apps/pumpkin-api.Tests/ApiKeyGenerator.cs`
- `apps/pumpkin-api.Tests/README.md`
- `apps/pumpkin-net-models/Models/Tenant.cs`
- `apps/pumpkin-net-models/Models/Page.cs`
- `apps/pumpkin-net-models/Models/Theme.cs`
- `apps/pumpkin-net-models/Models/User.cs`
- `apps/pumpkin-net-models/Models/FormEntry.cs`
- `apps/pumpkin-net-models/Models/HeroBlock.cs`
- `apps/pumpkin-net-models/Models/TrustBarBlock.cs`
- `apps/pumpkin-net-models/Models/CardGridBlock.cs`
- `apps/pumpkin-net-models/Models/HowItWorksBlock.cs`
- `apps/pumpkin-net-models/Models/FaqBlock.cs`
- `apps/pumpkin-net-models/Models/PrimaryCtaBlock.cs`
- `apps/pumpkin-net-models/Models/ContactBlock.cs`
- `apps/pumpkin-net-models/Models/HtmlBlockFactory.cs`
- `apps/ice-rink-web/src/data/fallback-home.ts`
- `apps/ice-rink-web/src/data/fallback-theme.ts`
- `ICE_RINK_BACKEND_API_CONNECTION_PLAN.md`

## Required Containers

Database:

```text
PumpkinCMS
```

Containers, each with partition key `/tenantId`:

```text
Tenant
Page
Theme
User
FormEntry
```

The API code uses singular `Page`, not `Pages`.

## Exact Model Shapes

### Tenant

Important query fields:

- `tenantId`
- `status`
- `apiKeyMeta.isActive`
- `apiKeyHash`

The public content API validates a tenant with:

```sql
SELECT * FROM c
WHERE c.tenantId = @tenantId
AND c.status = 'active'
AND c.apiKeyMeta.isActive = true
```

Then it verifies the incoming Bearer API key against `apiKeyHash` with BCrypt.

### Theme

Important query fields:

- `tenantId`
- `isActive`
- `themeId`

The active public theme endpoint queries `Theme` where `tenantId` matches and `isActive = true`.

### Page

Important query fields:

- `tenantId`
- `pageSlug`
- `isPublished`
- `includeInSitemap`

Manual seed documents should preserve the mixed casing used by `Page.cs`:

- `id`
- `PageId`
- `tenantId`
- `pageSlug`
- `PageVersion`
- `Layout`
- `MetaData`
- `searchData`
- `ContentData`
- `ContentData.ContentBlocks`
- `contentRelationships`
- `seo`
- `isPublished`
- `publishedAt`
- `includeInSitemap`

### User

`User.cs` has no explicit `JsonPropertyName` attributes. The Cosmos serializer uses camelCase for unannotated properties, so use:

- `id`
- `tenantId`
- `email`
- `username`
- `passwordHash`
- `firstName`
- `lastName`
- `role`
- `isActive`
- `createdDate`
- `lastLogin`
- `permissions`

Use numeric `role` values for the safest manual seed:

- `0`: `SuperAdmin`
- `1`: `TenantAdmin`
- `2`: `Editor`
- `3`: `Viewer`

### FormEntry

No seed entry is required for first page rendering, but the model shape is:

- `id`
- `tenantId`
- `formId`
- `pageSlug`
- `formData`
- `submittedAt`
- `ipAddress`
- `userAgent`
- `metadata.source`
- `metadata.referrer`
- `metadata.status`
- `metadata.tags`

## Casing Risks

- `PageId`, `PageVersion`, `Layout`, `MetaData`, `ContentData`, and `ContentData.ContentBlocks` are intentionally PascalCase in JSON because of `JsonPropertyName` attributes.
- `pageId`, `pageVersion`, `layout`, `metaData`, or `contentData` may deserialize in some paths because the Cosmos serializer is case-insensitive, but code and queries are written around the committed model casing. Use the exact casing above.
- `Page` sitemap projection reads `c.MetaData.updatedAt`, so `MetaData` is the safe casing.
- `Tenant` validation needs `apiKeyMeta.isActive`, not `apiKeyMeta.IsActive`.
- `User` lookup queries `c.email`, so use lowercase `email`, not `Email`.
- `CardGrid` card image alt text is `image-alt` in C#.
- Open Graph and Twitter fields use literal keys such as `og:title` and `twitter:card`.
- Current C# `HeroContent` does not define `eyebrow`, `secondaryButtonText`, `secondaryButtonLink`, or `trustLine`. If those are inserted into a known `Hero` block, they are likely dropped when the API deserializes and reserializes the page. For this seed, use standard `Hero` plus `PrimaryCTA` instead of relying on enhanced fallback-only hero fields.

## API Key And Password Generation

Run the existing utility:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\apps\pumpkin-api.Tests"
dotnet run
```

Save:

- The printed plain API key. This goes into `apps/ice-rink-web/.env.local` as `ICE_RINK_RENTALS_API_KEY`.
- The printed API hash. This goes into the tenant document as `apiKeyHash`.
- The printed plain password if using the optional admin user.
- The printed password hash if using the optional admin user.

The utility is currently hard-coded for an `admin` tenant. For this pass, do not edit it. Run it, copy the generated secret values, and adapt the JSON below for `ice-rink-rentals`.

## Seed JSON

Replace placeholders before inserting:

- `<bcrypt-api-key-hash>` from `apps/pumpkin-api.Tests`.
- `<password-hash>` from `apps/pumpkin-api.Tests`, if adding an admin user.

### Tenant: `Tenant` Container

```json
{
  "id": "ice-rink-rentals",
  "tenantId": "ice-rink-rentals",
  "name": "Ice Skating Rink Rentals",
  "plan": "local-dev",
  "status": "active",
  "apiKey": "",
  "apiKeyHash": "<bcrypt-api-key-hash>",
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
    "email": "hello@iceskatingrinkrentals.com",
    "phone": ""
  },
  "billing": {
    "cycle": "none",
    "nextInvoice": null
  }
}
```

### Active Theme: `Theme` Container

This is a seed-ready compact version of the ice-rink fallback theme. It includes styles for the blocks used by the seed home page.

```json
{
  "id": "ice-rink-rentals-default",
  "themeId": "ice-rink-rentals-default",
  "tenantId": "ice-rink-rentals",
  "name": "Ice Skating Rink Rentals Default Theme",
  "description": "Local development theme for Ice Skating Rink Rentals.",
  "isActive": true,
  "header": {
    "logoUrl": "",
    "logoAlt": "Ice Skating Rink Rentals",
    "sticky": true,
    "ctaText": "Get a Quote",
    "ctaUrl": "/contact",
    "ctaTarget": "_self",
    "classNames": {
      "root": "sticky top-0 z-50 w-full border-b border-sky-100 bg-white/90 backdrop-blur-md",
      "container": "max-w-6xl mx-auto px-6 md:px-8 flex items-center justify-between h-16",
      "logoWrapper": "flex items-center gap-2.5 group",
      "logoIcon": "hidden",
      "logoText": "text-lg font-extrabold text-slate-950 tracking-tight group-hover:text-sky-700 transition-colors",
      "nav": "hidden md:flex items-center gap-7 text-sm font-medium text-slate-600",
      "navLink": "hover:text-sky-700 transition-colors",
      "ctaButton": "hidden md:inline-flex items-center gap-2 px-5 py-2 bg-sky-700 text-white text-sm font-bold rounded-full hover:bg-sky-800 transition-all shadow-sm"
    }
  },
  "footer": {
    "copyright": "Copyright {year} Ice Skating Rink Rentals. All rights reserved.",
    "description": "Portable Ice Rink Rentals for events, seasonal activations, venues, and private celebrations.",
    "classNames": {
      "root": "w-full border-t border-sky-100 bg-slate-950 text-white",
      "container": "max-w-6xl mx-auto px-6 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8",
      "brandSection": "md:col-span-2",
      "brandLogoWrapper": "flex items-center gap-2",
      "brandLogoIcon": "hidden",
      "brandLogoText": "text-lg font-extrabold text-white",
      "brandDescription": "text-sm text-slate-300 mt-2 max-w-sm",
      "columnTitle": "text-xs font-bold uppercase tracking-widest text-sky-200 mb-3",
      "columnList": "space-y-2 text-sm text-slate-300",
      "columnLink": "hover:text-white transition-colors",
      "bottomBar": "border-t border-white/10",
      "bottomBarInner": "max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between text-xs text-slate-400",
      "builtWith": "underline hover:text-white transition-colors"
    }
  },
  "blockStyles": {
    "Hero": {
      "root": "relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_#e0f2fe,_transparent_34%),linear-gradient(135deg,_#f8fafc_0%,_#e0f2fe_42%,_#bae6fd_100%)]",
      "overlay": "absolute inset-0 bg-white/10",
      "container": "relative z-10 mx-auto grid min-h-[520px] max-w-6xl grid-cols-1 items-center gap-10 px-6 py-14 md:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] md:px-8 md:py-20",
      "headline": "max-w-3xl text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl lg:text-6xl",
      "subheadline": "mt-5 max-w-2xl text-base leading-8 text-slate-700 md:text-lg",
      "actions": "mt-8 flex flex-col gap-3 sm:flex-row sm:items-center",
      "button": "inline-flex min-h-12 items-center justify-center rounded-full bg-sky-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-900/15 transition-colors hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
      "mainImage": "w-full rounded-2xl border border-white/60 object-cover shadow-2xl shadow-sky-900/20"
    },
    "TrustBar": {
      "root": "w-full border-y border-sky-100 bg-white py-8",
      "container": "mx-auto max-w-6xl px-6 md:px-8",
      "grid": "grid grid-cols-2 gap-6 md:grid-cols-4",
      "item": "text-center",
      "icon": "mx-auto mb-3 h-10 w-10 text-sky-700",
      "itemTitle": "text-sm font-extrabold text-slate-950",
      "itemText": "mt-1 text-xs leading-5 text-slate-500"
    },
    "CardGrid": {
      "root": "w-full bg-white py-14 md:py-20",
      "container": "mx-auto max-w-6xl px-6 md:px-8",
      "header": "mb-10 max-w-3xl",
      "title": "text-3xl font-extrabold leading-tight text-slate-950 md:text-4xl",
      "subtitle": "mt-3 text-base leading-7 text-slate-600 md:text-lg",
      "grid": "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
      "card": "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
      "cardIcon": "mb-4 text-sky-700",
      "cardTitle": "text-lg font-extrabold text-slate-950",
      "cardDescription": "mt-2 text-sm leading-6 text-slate-600",
      "cardLink": "mt-4 inline-flex text-sm font-bold text-sky-700 hover:text-sky-900"
    },
    "HowItWorks": {
      "root": "w-full bg-white py-14 md:py-20",
      "container": "mx-auto max-w-6xl px-6 md:px-8",
      "title": "mb-10 text-3xl font-extrabold leading-tight text-slate-950 md:text-4xl",
      "steps": "grid grid-cols-1 gap-5 md:grid-cols-4",
      "step": "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
      "stepImage": "hidden",
      "stepNumber": "mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white",
      "stepTitle": "text-base font-extrabold text-slate-950",
      "stepText": "mt-2 text-sm leading-6 text-slate-600"
    },
    "FAQ": {
      "root": "w-full bg-slate-50 py-14 md:py-20",
      "container": "mx-auto max-w-4xl px-6 md:px-8",
      "header": "mb-10 max-w-3xl",
      "title": "text-3xl font-extrabold leading-tight text-slate-950 md:text-4xl",
      "subtitle": "mt-3 text-base leading-7 text-slate-600",
      "list": "space-y-3",
      "item": "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
      "question": "flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-slate-950 transition-colors hover:bg-sky-50",
      "questionIcon": "shrink-0 text-sky-700 transition-transform",
      "answer": "px-5 pb-5 text-sm leading-6 text-slate-600"
    },
    "PrimaryCTA": {
      "root": "relative w-full overflow-hidden bg-sky-800",
      "overlay": "absolute inset-0 bg-slate-950/10",
      "container": "relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-14 md:flex-row md:items-center md:justify-between md:px-8",
      "textWrapper": "max-w-2xl",
      "title": "text-3xl font-extrabold leading-tight text-white md:text-4xl",
      "description": "mt-4 text-base leading-7 text-sky-50 md:text-lg",
      "button": "inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-sky-800 shadow-lg transition-colors hover:bg-sky-50",
      "secondaryWrapper": "mt-4 text-sm font-medium text-sky-100",
      "secondaryLink": "font-bold text-white underline underline-offset-4 hover:text-sky-100"
    }
  },
  "menu": [
    { "label": "Rentals", "url": "/ice-rink-rentals", "target": "_self", "icon": "", "order": 1, "isVisible": true, "children": [] },
    { "label": "Events", "url": "/events-holiday-activations", "target": "_self", "icon": "", "order": 2, "isVisible": true, "children": [] },
    { "label": "Contact", "url": "/contact", "target": "_self", "icon": "", "order": 3, "isVisible": true, "children": [] }
  ],
  "createdAt": "2026-05-13T00:00:00Z",
  "updatedAt": "2026-05-13T00:00:00Z"
}
```

### Published Home Page: `Page` Container

```json
{
  "id": "ice-rink-rentals-home",
  "PageId": "ice-rink-rentals-home",
  "tenantId": "ice-rink-rentals",
  "pageSlug": "home",
  "PageVersion": 1,
  "Layout": "default",
  "MetaData": {
    "category": "rentals",
    "product": "portable ice rink",
    "keyword": "portable ice rink rentals",
    "pageType": "landing",
    "title": "CMS LIVE: Portable Ice Rink Rentals for Events",
    "description": "Portable ice rink rentals for events, schools, towns, corporate parties, and holiday activations.",
    "createdAt": "2026-05-13T00:00:00Z",
    "updatedAt": "2026-05-13T00:00:00Z",
    "author": "Ice Skating Rink Rentals Team",
    "language": "en-us",
    "market": "us"
  },
  "searchData": {
    "state": "",
    "city": "",
    "metro": "",
    "county": "",
    "keyword": "portable ice rink rentals",
    "tags": ["portable ice rink rentals", "ice rink rentals", "holiday activations"],
    "contentSummary": "Ice Skating Rink Rentals helps event planners and venues book portable rink rentals with clear requirements, package guidance, and quote intake.",
    "blockTypes": ["Hero", "TrustBar", "CardGrid", "HowItWorks", "FAQ", "PrimaryCTA"]
  },
  "ContentData": {
    "ContentBlocks": [
      {
        "type": "Hero",
        "content": {
          "type": "Main",
          "headline": "CMS LIVE: Portable Ice Rink Rentals for Events",
          "subheadline": "Plan portable rink rentals for events, schools, towns, corporate parties, and holiday activations with setup guidance, venue planning, and quote support.",
          "backgroundImage": "",
          "backgroundImageAltText": "",
          "mainImage": "",
          "mainImageAltText": "Portable ice rink rental event setup",
          "buttonText": "Get a Quote",
          "buttonLink": "/contact"
        }
      },
      {
        "type": "TrustBar",
        "content": {
          "items": [
            { "icon": "CalendarCheck", "title": "Event Ready", "text": "Private, public, and seasonal rentals", "alt": "Event ready" },
            { "icon": "MapPin", "title": "Venue Planning", "text": "Space, access, and setup guidance", "alt": "Venue planning" },
            { "icon": "ShieldCheck", "title": "Requirements First", "text": "Clear safety and logistics review", "alt": "Requirements first" },
            { "icon": "Clock", "title": "Fast Quotes", "text": "Tell us the date, place, and scope", "alt": "Fast quotes" }
          ]
        }
      },
      {
        "type": "CardGrid",
        "content": {
          "title": "Rental solutions for every event format",
          "subtitle": "Plan portable rink rentals around venue requirements, event goals, setup windows, and guest flow.",
          "layout": "grid-3",
          "cards": [
            {
              "title": "Holiday activations",
              "description": "Create a seasonal attraction for towns, malls, shopping districts, hotels, and brand activations.",
              "image": "",
              "image-alt": "",
              "icon": "Sparkles",
              "link": "/events-holiday-activations",
              "alt": "Holiday activations"
            },
            {
              "title": "Private celebrations",
              "description": "Give weddings, milestone birthdays, school events, and community gatherings a standout winter experience.",
              "image": "",
              "image-alt": "",
              "icon": "PartyPopper",
              "link": "/ice-rink-rentals",
              "alt": "Private celebrations"
            },
            {
              "title": "Commercial venues",
              "description": "Add a bookable attraction for venues with enough space, access, and operational support.",
              "image": "",
              "image-alt": "",
              "icon": "Building2",
              "link": "/contact",
              "alt": "Commercial venues"
            }
          ]
        }
      },
      {
        "type": "HowItWorks",
        "content": {
          "title": "How rentals are planned",
          "steps": [
            { "title": "Share your event", "text": "Send the date, location, expected attendance, surface type, and event goals.", "image": "", "alt": "Share your event" },
            { "title": "Review requirements", "text": "Confirm space, access, power, timing, staffing, permits, and weather considerations.", "image": "", "alt": "Review requirements" },
            { "title": "Finalize a package", "text": "Choose the rental size, add-ons, schedule, and support level that fit the event.", "image": "", "alt": "Finalize a package" }
          ]
        }
      },
      {
        "type": "FAQ",
        "content": {
          "title": "Common rental questions",
          "subtitle": "Start with the basics so the quote conversation is faster and more useful.",
          "layout": "accordion",
          "items": [
            { "question": "How far ahead should we request a quote?", "answer": "Earlier is better, especially for holiday and winter-season events. Share your event date, location, and site details first." },
            { "question": "What information is needed for pricing?", "answer": "The team needs event dates, venue address, setup surface, available space, rental duration, guest count, and any add-ons." },
            { "question": "Can portable rinks work indoors or outdoors?", "answer": "Both may be possible depending on surface, access, weather exposure, power, staffing, permits, and event duration." }
          ]
        }
      },
      {
        "type": "PrimaryCTA",
        "content": {
          "title": "Ready to plan portable ice rink rentals?",
          "description": "Send the basics and the team can help identify the right rental path for your event.",
          "buttonText": "Request a Quote",
          "buttonLink": "/contact",
          "secondaryText": "Need package details first?",
          "secondaryLinkText": "View rental options",
          "secondaryLink": "/ice-rink-rentals",
          "backgroundImage": "",
          "mainImage": "",
          "alt": "Portable Ice Rink Rentals quote request"
        }
      }
    ]
  },
  "contentRelationships": {
    "isHub": true,
    "hubPageSlug": "",
    "topicCluster": "ice-rink-rentals",
    "relatedHubs": [],
    "spokePriority": 0
  },
  "seo": {
    "metaTitle": "CMS LIVE: Portable Ice Rink Rentals for Events",
    "metaDescription": "Book portable ice rink rentals for events, holiday activations, private parties, schools, and venues.",
    "keywords": ["portable ice rink rentals", "ice rink rentals", "portable ice rinks for events"],
    "robots": "index, follow",
    "canonicalUrl": "https://iceskatingrinkrentals.com/",
    "alternateUrls": [],
    "structuredData": [
      "{\"@context\":\"https://schema.org\",\"@type\":\"LocalBusiness\",\"name\":\"Ice Skating Rink Rentals\",\"url\":\"https://iceskatingrinkrentals.com/\",\"description\":\"Portable Ice Rink Rentals for events and venues.\"}"
    ],
    "openGraph": {
      "og:title": "CMS LIVE: Portable Ice Rink Rentals for Events",
      "og:description": "Plan portable ice rink rentals for events, venues, and seasonal activations.",
      "og:type": "website",
      "og:url": "https://iceskatingrinkrentals.com/",
      "og:image": "",
      "og:image:alt": "Ice Skating Rink Rentals",
      "og:site_name": "Ice Skating Rink Rentals",
      "og:locale": "en_US"
    },
    "twitterCard": {
      "twitter:card": "summary_large_image",
      "twitter:title": "CMS LIVE: Portable Ice Rink Rentals for Events",
      "twitter:description": "Plan portable ice rink rentals for events, venues, and seasonal activations.",
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

### Optional Admin User: `User` Container

Use this only if admin login is needed. Replace `<password-hash>` with the hash printed by `apps/pumpkin-api.Tests`.

```json
{
  "id": "ice-rink-local-admin",
  "tenantId": "ice-rink-rentals",
  "email": "admin@iceskatingrinkrentals.com",
  "username": "ice-rink-admin",
  "passwordHash": "<password-hash>",
  "firstName": "Ice Rink",
  "lastName": "Admin",
  "role": 1,
  "isActive": true,
  "createdDate": "2026-05-13T00:00:00Z",
  "lastLogin": null,
  "permissions": [
    "pages:create",
    "pages:read",
    "pages:update",
    "pages:delete",
    "users:create",
    "users:read",
    "users:update",
    "forms:read"
  ]
}
```

### Optional FormEntry Shape

No form entry is required for initial rendering. If a test form submission is needed later, use:

```json
{
  "id": "ice-rink-test-form-entry",
  "tenantId": "ice-rink-rentals",
  "formId": "quote-form",
  "pageSlug": "contact",
  "formData": {
    "name": "Test User",
    "email": "test@example.com",
    "eventDate": "2026-12-01",
    "eventLocation": "Test City, ST",
    "eventDetails": "Testing local Pumpkin CMS form storage."
  },
  "submittedAt": "2026-05-13T00:00:00Z",
  "ipAddress": "127.0.0.1",
  "userAgent": "local-seed",
  "metadata": {
    "source": "local-seed",
    "referrer": "http://localhost:3002/contact",
    "status": "new",
    "tags": ["local-dev", "ice-rink-rentals"]
  }
}
```

## PowerShell Flow

Generate secrets:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\apps\pumpkin-api.Tests"
dotnet run
```

Run the API:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\apps\pumpkin-api"
dotnet run
```

Update frontend env:

```env
PUMPKIN_API_URL=http://localhost:5064
ICE_RINK_RENTALS_TENANT_ID=ice-rink-rentals
ICE_RINK_RENTALS_API_KEY=<plain-api-key-from-generator>
ICE_RINK_RENTALS_CANONICAL_URL=https://iceskatingrinkrentals.com
```

Restart the frontend:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\apps\ice-rink-web"
npm run dev
```

## API Verification

Set variables:

```powershell
$api = "http://localhost:5064"
$tenantId = "ice-rink-rentals"
$apiKey = "<plain-api-key-from-generator>"
$headers = @{ Authorization = "Bearer $apiKey"; Accept = "application/json" }
```

Check API root:

```powershell
Invoke-RestMethod -Uri "$api/"
```

Fetch the seeded home page:

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/home" -Headers $headers |
  ConvertTo-Json -Depth 80
```

Fetch active theme:

```powershell
Invoke-RestMethod -Uri "$api/api/themes/$tenantId" -Headers $headers |
  ConvertTo-Json -Depth 80
```

Fetch sitemap:

```powershell
Invoke-RestMethod -Uri "$api/api/tenant/$tenantId/sitemap" -Headers $headers |
  ConvertTo-Json -Depth 20
```

Optional admin login:

```powershell
$loginBody = @{
  email = "admin@iceskatingrinkrentals.com"
  password = "<plain-admin-password-from-generator>"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "$api/api/auth/login" `
  -ContentType "application/json" `
  -Body $loginBody
```

Expected API success:

- Home page returns `200 OK`.
- Home page JSON includes `tenantId: "ice-rink-rentals"`.
- Home page JSON includes `pageSlug: "home"`.
- Home page JSON includes `CMS LIVE: Portable Ice Rink Rentals for Events`.
- Theme endpoint returns `isActive: true`.
- Sitemap response includes `home`.

## Frontend Verification

Open:

```text
http://localhost:3002/
```

Expected frontend success:

- The hero headline or page metadata visibly includes `CMS LIVE: Portable Ice Rink Rentals for Events`.
- The server console no longer logs `ECONNREFUSED` for `localhost:5064`.
- If the API is stopped or the API key is removed, the app returns to fallback content.
- `http://localhost:3002/sitemap.xml` uses API sitemap data when the API succeeds.

## Local-Only Seed Script Plan

Do not implement this yet without confirmation.

If a script is approved, the safest version is a generate-only command, not a database writer:

```text
apps/pumpkin-api.Tests
  dotnet run -- --generate-ice-rink-seed-json
```

Proposed behavior:

- Preserve the current default `dotnet run` behavior.
- Add optional CLI args for tenant ID, brand, email, password, and output directory.
- Generate a plain API key and BCrypt hash.
- Generate an optional admin password hash.
- Write four local JSON files under a gitignored output folder, for example `apps/pumpkin-api.Tests/seed-output/ice-rink-rentals/`.
- Print the plain API key and admin password once.
- Do not connect to Cosmos by default.
- Add an explicit future `--apply` mode only after review, with required confirmation flags.

Why this is safer:

- It reuses the existing BCrypt implementation.
- It avoids hard-coded local secrets.
- It does not mutate any database unless a separate reviewed apply mode is added.
- It keeps production API code untouched.

## Existing Generator Reuse

The current generator can be reused immediately without code changes for:

- API key generation: `RandomNumberGenerator.GetBytes(32)` plus Base64.
- API key hashing: `BCrypt.Net.BCrypt.HashPassword(apiKey, 12)`.
- Password hashing: `BCrypt.Net.BCrypt.HashPassword(password)`.
- Example user document generation.

Current limitation:

- `Program.cs` is hard-coded to output an `admin` tenant and `admin@pumpkincms.io`.
- The local seed strategy should adapt the generated secret values manually rather than editing the generator for this pass.

## Next Implementation Step

Manually insert the tenant, theme, and home page JSON into Cosmos DB, update `apps/ice-rink-web/.env.local` with the plain API key, and run the PowerShell verification commands. After that works, ask for approval to add a generate-only local seed helper so future tenants do not require hand-built JSON.
