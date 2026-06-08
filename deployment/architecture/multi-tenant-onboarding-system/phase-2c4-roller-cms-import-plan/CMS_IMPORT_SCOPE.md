# CMS Import Scope

## Scope

Phase 2C-4 defines what a future Roller CMS import would need to import into a draft or preview CMS scope after a separate explicit approval.

The future CMS import would likely involve these CMS concepts:

- tenant record
- site record
- route records or route allowlist
- page/content block records
- media asset references or placeholders
- form definitions and form routing references
- SEO metadata
- redirects
- theme/settings

These concepts are planning assumptions based on local import package files. This plan does not assume hidden CMS table names, APIs, IDs, or implementation details that are not already documented locally.

## Current Roller Input

The validated local Roller package includes:

- `manifest.json`
- `tenant.json`
- `site.json`
- `routes.json`
- `pages/home.json`
- `pages/contact.json`
- `pages/service-areas.json`
- `media-assets.json`
- `forms.json`
- `seo.json`
- `theme.json`
- `redirects.json`
- validation and support outputs

## Not In Scope

- no CMS import now
- no tenant creation now
- no CMS writes now
- no MediaAsset writes now
- no media binary upload now
- no static generation
- no deployment
- no external validation
- no form delivery test
- no Search Console or indexing
- no live pages

## Future Import Target

Any later CMS import must target draft/preview-only scope. It must not make public pages live, trigger deployment, send email, write external infrastructure, or request indexing.
