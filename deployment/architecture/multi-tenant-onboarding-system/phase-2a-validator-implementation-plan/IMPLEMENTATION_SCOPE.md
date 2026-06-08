# Implementation Scope

## First Build Target

Phase 2A implementation should build the offline intake/import validation engine only.

It should validate:

- tenant intake package completeness
- import package folder structure
- JSON parse status
- JSON Schema conformance
- cross-file tenant and site consistency
- approved route and forbidden route policy
- media references
- form references
- SEO, canonical, noindex, sitemap policy fields
- deployment profile references
- forbidden local/protected paths
- URL safety rules
- secret-looking values with redacted reporting
- validation report generation

## Required Offline Boundary

The validator must not:

- write CMS records
- write MediaAsset records
- call Azure APIs
- call Cloudflare APIs
- call DNS providers
- deploy
- change Function App settings
- send form submissions or email
- touch Microsoft 365
- use Search Console
- request indexing
- read protected config
- touch Roller

## Future Deferred Targets

These are out of Phase 2A implementation:

- CMS preview import
- static export execution
- media upload or MediaAsset update
- form endpoint checks against live endpoints
- staging deployment
- production cutover
- Search Console/indexing
- Admin UI wizard implementation
- extension pack implementation

