# Provider Mode Transition Plan

Current modes:

- Admin current: `admin-local-fixture-readonly`;
- API current: `api-local-fixture-readonly`;
- source fixture: `local-fixture-readonly`.

Future Admin mode:

- `admin-api-readonly`.

V2.9.11 transition steps:

1. Keep `admin-local-fixture-readonly` as the default provider.
2. Add a provider selector boundary that can choose `admin-api-readonly` from a safe, non-secret runtime setting or explicit test override.
3. Extend Admin contract validation to accept `api-local-fixture-readonly` envelope provider mode only when Admin mode is `admin-api-readonly`.
4. Preserve fixture provider as fallback for API unavailable, auth error, non-200 response, non-read-only envelope, open write boundary, missing counts, or adapter validation failure.
5. Surface active provider mode, source provider mode, fallback reason, request ID, and correlation ID in Admin contract metadata.

Disallowed transitions:

- no direct transition to live provider mode;
- no removal of fixture fallback;
- no mutation provider mode;
- no API bridge mode that can POST, PUT, PATCH, or DELETE.

