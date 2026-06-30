# Page Schema Baseline Analysis

Source model:

- `apps/pumpkin-net-models/Models/Page.cs`
- Root route is represented by slug `home`.
- Tenant scope is stored in `tenantId`.
- Admin create/update routes validate JWT tenant scope and route tenant.

Initial seed review:

- Older local seed files existed for `home`, `contact`, and `service-areas`.
- Basic seed validation passed.
- The older `contact.json` still contained `hello@iceskatingrinkrentals.com`.
- The older `contact.json` failed stricter .NET production contract validation due missing domain/contact policy metadata and visible `formBlock`.

Selected baseline payloads:

- Homepage: `content-review/ice-approved-homepage-live-cms-promotion/homepage-live-cms-promotion-candidate.json`
- Contact: `content-review/ice-final-contact-live-cms-promotion/CONTACT_LIVE_CMS_PROMOTION_CANDIDATE.json`
- Service areas: `content-review/ice-service-areas-live-cms-promotion/SERVICE_AREAS_APPROVED_LIVE_CANDIDATE.json`

Each selected payload:

- Uses `tenantId: ice-rink-rentals`.
- Uses route slugs `home`, `contact`, or `service-areas`.
- Is published and included in sitemap.
- Contains `contact@iceskatingrinkrentals.com`.
- Does not contain `hello@iceskatingrinkrentals.com`.
- Passed `dotnet-page-contract validate-page`.
