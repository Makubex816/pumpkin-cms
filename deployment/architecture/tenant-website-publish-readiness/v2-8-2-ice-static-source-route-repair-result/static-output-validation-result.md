# Static Output Validation Result

The local static artifact was generated under ignored output and validated without deployment.

Public local validation endpoint contract:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

This endpoint URL is public by design and was already documented in the historical Ice static form proof. No live HTTP check was performed.

## Build

Command:

```text
npm run build:static:ice
```

Result:

- passed with warnings
- emitted `/`, `/contact`, and `/service-areas`
- Next auto-detected `.env.local`; no protected config was manually opened or printed

## Artifact Generation

Command:

```text
node scripts/static-publish.mjs generate
```

Result:

- passed
- page count: 3
- published count: 3
- sitemap count: 3
- redirect count: 0
- quality warnings: 35
- removed excluded preview output paths: `draft-preview`, `_next/static/chunks/app/draft-preview`

## Strict Static Output Validator

Command:

```text
node ../../deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out .static-artifacts/ice-rink-rentals/out
```

Result:

- passed
- file count: 42
- errors: 0
- warnings: 0

## Staging Package Validator

Command:

```text
node ../../deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder .static-artifacts/ice-rink-rentals/out
```

Result:

- passed
- file count: 42
- errors: 0
- warnings: 0

Generated static output remains ignored and unstaged.
