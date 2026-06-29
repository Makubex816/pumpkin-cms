# Source Change Summary

V2.8.33B source repair commit:

`0f56636b543d8872e6be4effa36ca2221632f4ff`

Commit message:

`fix: repair static contact bridge and close contact gate`

Changed source files:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs`

Verified source markers:

- `StaticFormDeliveryError` exists in the static contact handler.
- The handler preserves public-safe upstream statuses 400, 401, 403, 404, 405, and 409.
- The handler maps upstream 5xx and unknown delivery failures to public-safe 502.
- The handler falls back to the generated local entry id when upstream success response parsing yields no id.
- Tests cover upstream auth failure preservation, upstream server-error mapping, and success response fallback.

Current scoped status:

- The two source files are present.
- The scoped diff for those source files is clean at V2.8.33C start.
- No V2.8.33C source edits were made.
