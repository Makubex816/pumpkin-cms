# Error Explanation Result

Implemented a reusable error explanation library in:

```text
deployment/architecture/multi-tenant-onboarding-system/validator-implementation/src/error-explanations.mjs
```

Each registered error code includes:

- plain English meaning
- likely cause
- how to fix
- when to ask for help
- review owner

## CLI Access

```powershell
node src/cli.mjs --explain-error JSON_PARSE_ERROR
node src/cli.mjs --explain-code ROUTE_PAGE_MISSING
node src/cli.mjs --list-errors
```

## Starter Codes Covered

- `REQUIRED_FILE_MISSING`
- `JSON_PARSE_ERROR`
- `SCHEMA_VALIDATION_ERROR`
- `TENANT_ID_MISMATCH`
- `ROUTE_PAGE_MISSING`
- `UNKNOWN_MEDIA_REFERENCE`
- `UNKNOWN_FORM_REFERENCE`
- `FORBIDDEN_LOCAL_URL`
- `FORBIDDEN_STAGING_URL`
- `FORBIDDEN_SECRET_LIKE_VALUE`
- `SEO_NOINDEX_NOT_ALLOWED`
- `CANONICAL_ROUTE_MISMATCH`
- `SITEMAP_CANONICAL_MISMATCH`

Additional related Phase 2A local validator codes are also covered where they affect operator handoff.
