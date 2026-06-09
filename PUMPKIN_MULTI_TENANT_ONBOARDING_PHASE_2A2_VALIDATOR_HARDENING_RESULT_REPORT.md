# Pumpkin Multi-Tenant Onboarding Phase 2A-2 Validator Hardening Result Report

Generated: 2026-06-08

## Result

Implemented the approved Phase 2A-2 offline validator hardening.

Implementation package:

```text
deployment/architecture/multi-tenant-onboarding-system/validator-implementation/
```

Result package:

```text
deployment/architecture/multi-tenant-onboarding-system/phase-2a-validator-hardening-result/
```

## What Was Implemented

- deeper cross-file validation for tenantId, siteKey, routes, slugs, forbidden routes, obsolete routes, paused tenant references, and unrelated tenant references
- media reference validation between page blocks and `media-assets.json`
- form reference validation between page blocks and `forms.json`
- form endpoint placeholder validation
- lead recipient reference validation
- SEO/canonical validation for production-ready packages
- broader URL safety checks for local, staging, protected, credentialed, SAS/token, and JWT-looking URL values
- improved secret-pattern scanner
- normalized error code constants
- expanded gate statuses
- better JSON and Markdown report content
- expanded fake fixtures
- expanded Node built-in tests
- updated package docs

## Validation Rules Added

Key added codes include:

- `TENANT_ID_MISMATCH`
- `SITE_KEY_MISMATCH`
- `ROUTE_PAGE_MISSING`
- `FORBIDDEN_ROUTE_PRESENT`
- `UNKNOWN_MEDIA_REFERENCE`
- `UNKNOWN_FORM_REFERENCE`
- `FORBIDDEN_LOCAL_URL`
- `FORBIDDEN_STAGING_URL`
- `FORBIDDEN_SECRET_LIKE_VALUE`
- `SEO_NOINDEX_NOT_ALLOWED`
- `CANONICAL_ROUTE_MISMATCH`
- `SITEMAP_CANONICAL_MISMATCH`

## Test Results

Initial local checks passed:

- `npm test`: 9 tests passed
- `npm run check`: syntax checks passed and 9 tests passed
- `npm run validate:example`: valid fixture passed with 0 errors and 0 warnings

Final validation results are recorded after the complete local check pass.

## Fixture Results

Expanded fixture coverage now includes valid, required-file, JSON parse, schema, tenant mismatch, site key mismatch, route missing page, forbidden route, unknown media, unknown form, forbidden local URL, forbidden staging URL, production noindex, and secret-looking value cases.

## Known Limitations

- JSON Schema validation remains minimal and dependency-free.
- Deep block semantics are limited to documented reference field names.
- Deployment profile env-var classification, profile smoke-test fixtures, extension validation, and CLI/report polish remain future work.

## Readiness Classification

| Area | Status |
| --- | --- |
| Phase 2A-1 validator skeleton | complete |
| Phase 2A-2 validator hardening | yes |
| offline validation only | yes |
| external checks implemented | no |
| new tenant created | no |
| external systems changed | no |
| Search Console/indexing affected | no |
| Roller | paused |

## Boundary Confirmation

No tenant creation, CMS writes, MediaAsset writes, Azure changes, Cloudflare changes, DNS changes, deployment, Function setting changes, email/Microsoft 365 work, Search Console/indexing action, external checks, protected config reads, secret printing, generated artifact staging, raw content-review staging, or Roller work occurred.

## Final Validation

| Check | Result |
| --- | --- |
| `npm test` from validator package | Passed, 9 tests |
| `npm run check` from validator package | Passed, source syntax checks plus 9 tests |
| `npm run validate:example` | Passed, valid fixture generated local reports with 0 errors and 0 warnings |
| Hardening manifest JSON parse | Passed |
| JSON parse for new/changed JSON files | Passed for 150 JSON files; intentionally excluded `fixtures/invalid-json/site.json` |
| `node --check` for validator JS/MJS | Passed, 18 `.mjs` files |
| `git diff --check` | Passed with existing repository line-ending warnings only |
| Trailing whitespace scan for Phase 2A-2 scope | Passed |
| Protected/generated/raw path check for Phase 2A-2 scope | Passed |
| Targeted secret-like value scan for Phase 2A-2 scope | Passed; intentionally excluded `fixtures/invalid-secret-looking-value/` |
| CMS/MediaAsset/Azure/Cloudflare/DNS/deployment/Function/email/Microsoft 365/Search Console/indexing/Roller boundary | No actions performed |
