# Test Plan

Phase 2A implementation should include fixtures and tests before acceptance.

## Fixture Matrix

| Fixture | Expected result |
| --- | --- |
| valid package fixture | passes offline validation |
| missing required field fixture | fails with friendly missing-field message |
| bad route fixture | fails route-policy validator |
| missing media fixture | fails media-reference validator |
| forbidden local URL fixture | fails URL safety validator |
| unknown form fixture | fails form-reference validator |
| noindex fixture | warning or fail depending target gate |
| staging URL in production field fixture | fails URL safety/SEO validator |
| cross-tenant reference fixture | fails cross-file validator |
| paused tenant reference fixture | fails or blocks with paused tenant message |
| secret-looking value fixture | fails secret scanner and redacts value |
| unsupported schema version fixture | fails schema-loader/schema-validator |
| unknown deployment profile fixture | fails deployment profile reference check |
| deployment profile env-var classification fixture | fails if a secret-like value is treated as public config or if required profile config is missing |
| extension permission fixture | fails or is explicitly skipped with a deferred status if extension validation is out of Phase 2A scope |
| extension migration schema fixture | fails or is explicitly skipped with a deferred status if extension validation is out of Phase 2A scope |

## Profile Smoke-Test Matrix

Smoke tests are offline fixture checks only. They must not call Azure, Cloudflare, DNS, email, Microsoft 365, Search Console, CMS, MediaAsset, or deployment APIs.

| Profile family | Fixture focus |
| --- | --- |
| Azure Static Web Apps plus Functions | required function endpoint fields, no protected Function settings, no production localhost URLs |
| Cloudflare Pages plus Worker | allowed worker endpoint fields, no DNS mutation, no staging/default-host canonical URLs |
| Static Azure plus Cloudflare CDN | declared media/domain fields, no unapproved local `/media` production URLs |
| Existing API dynamic site | CMS/API references are validated as inert references only |
| No-email lead capture | form and analytics choices are explicit, with no email or Microsoft 365 dependency |

## Unit Test Targets

- schema registry loads all schemas
- JSON parse errors are mapped safely
- schema errors are mapped to friendly findings
- route coverage is deterministic
- URL safety detector redacts secret-like URLs
- gate status normalizer maps findings to expected status
- report writer emits valid JSON and Markdown
- deployment profile environment-variable classifier separates public config, secret config, required config, and optional config
- extension permission and migration schema handling is either validated or reported as deferred with a stable finding code

## Snapshot Tests

Snapshot non-technical messages for:

- missing field
- bad route
- missing media
- unknown form
- local media URL
- staging canonical URL
- secret-looking value
- Search Console final gate blocked

## No External Mutation Tests

Tests should assert the validator does not:

- call network APIs
- read protected config
- write outside approved output directory
- write CMS or MediaAsset records
- invoke deployment commands
