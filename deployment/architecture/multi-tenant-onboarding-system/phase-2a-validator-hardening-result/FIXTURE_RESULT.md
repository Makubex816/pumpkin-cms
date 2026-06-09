# Fixture Result

Expanded fake fixture coverage:

- `valid-minimal`
- `invalid-missing-required-file`
- `invalid-json`
- `invalid-schema`
- `invalid-cross-file`
- `invalid-tenant-id-mismatch`
- `invalid-site-key-mismatch`
- `invalid-route-missing-page`
- `invalid-forbidden-route-present`
- `invalid-unknown-media-reference`
- `invalid-unknown-form-reference`
- `invalid-forbidden-local-url`
- `invalid-forbidden-staging-url`
- `invalid-noindex-production-page`
- `invalid-secret-looking-value`

Expected primary results:

| Fixture | Primary expected code |
| --- | --- |
| `valid-minimal` | none, passes |
| `invalid-missing-required-file` | `REQUIRED_FILE_MISSING` |
| `invalid-json` | `JSON_PARSE_ERROR` |
| `invalid-schema` | `SCHEMA_VALIDATION_ERROR` |
| `invalid-cross-file` | `TENANT_ID_MISMATCH` |
| `invalid-tenant-id-mismatch` | `TENANT_ID_MISMATCH` |
| `invalid-site-key-mismatch` | `SITE_KEY_MISMATCH` |
| `invalid-route-missing-page` | `ROUTE_PAGE_MISSING` |
| `invalid-forbidden-route-present` | `FORBIDDEN_ROUTE_PRESENT` |
| `invalid-unknown-media-reference` | `UNKNOWN_MEDIA_REFERENCE` |
| `invalid-unknown-form-reference` | `UNKNOWN_FORM_REFERENCE` |
| `invalid-forbidden-local-url` | `FORBIDDEN_LOCAL_URL` |
| `invalid-forbidden-staging-url` | `FORBIDDEN_STAGING_URL` |
| `invalid-noindex-production-page` | `SEO_NOINDEX_NOT_ALLOWED` |
| `invalid-secret-looking-value` | `FORBIDDEN_SECRET_LIKE_VALUE` |

Fixtures use fake example domains only. No real tenant secrets are included.
