# CMS Content Backup Preflight Plan

## Future CMS Export Scope

Future read/export should capture Ice tenant CMS state for:

- tenant record;
- site record;
- domain bindings;
- pages;
- page versions if safe and approved;
- routes;
- forms;
- form recipient references without secret delivery credentials;
- SEO fields;
- redirects;
- theme/settings;
- MediaAsset metadata;
- import/history metadata if safe and non-secret.

## Expected Route Mapping

| Route | Expected Backup Decision |
| --- | --- |
| `/` | include as approved live homepage |
| `/contact` | include as approved live contact page |
| `/service-areas` | include as approved live service areas page |
| `/ice-rink-rentals` | record as obsolete/404 evidence, do not recreate as live route |
| `/events-holiday-activations` | record as obsolete/404 evidence, do not recreate as live route |

## Export Format

- Structured JSON for machine validation.
- Markdown summaries for operator review.
- Checksums for every exported file.
- Manifest entries for every exported file.
- No raw auth headers, cookies, tokens, JWTs, or protected config values.

## Readback Validation

The future execution should compare:

- tenant/site identity;
- page count;
- route table;
- route status for approved and obsolete routes;
- sitemap inclusion flags;
- form definitions and recipient reference presence;
- SEO/canonical/robots fields;
- redirect rules;
- theme references.

## Phase 2F-7 Boundary

No CMS/API calls, CMS reads, CMS writes, MediaAsset writes, import, export, or route changes occur in this phase.
