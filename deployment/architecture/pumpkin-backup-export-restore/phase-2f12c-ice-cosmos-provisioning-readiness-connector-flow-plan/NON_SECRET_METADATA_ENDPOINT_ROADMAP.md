# Non-Secret Metadata Endpoint Roadmap

## Endpoint Role

The future endpoint gives Backup Center non-secret provider metadata from the CMS runtime so it can verify the database source without reading protected config.

## Roadmap Steps

1. Define response schema and tests.
2. Add backup source-read authorization.
3. Implement GET-only endpoint.
4. Strip forbidden fields.
5. Add audit logging.
6. Add resolver integration.
7. Run live read-only verification in a later approved phase.

## Contract Requirements

- GET only.
- JWT auth required.
- No tenant API keys.
- No raw tenant/page/form/media payloads.
- No protected config.
- No connection strings, keys, tokens, cookies, auth headers, SAS URLs, or raw app settings.
- Response includes provider type/status, metadata-only scope names, backup support flags, redaction status, and blockers.

## Runtime Use

The endpoint should support both:

- configured source: returns provider metadata and readiness flags;
- missing source: returns `providerStatus = missing`, `selectedTargetProvider = cosmos`, and live connector execution blocked.
