# Static Contact Bridge Repair Result

Files changed:

- `deployment/static-azure/forms/static-form-endpoint-compat/contact-handler.mjs`
- `deployment/static-azure/forms/static-form-endpoint-compat/test-static-form-endpoint-compat.mjs`

Repair:

- Added public-safe upstream status/code handling for Pumpkin API non-OK responses.
- Preserved 400, 401, 403, 404, 405, and 409 as public-safe statuses.
- Mapped upstream 5xx and unknown delivery failures to public-safe 502.
- Added a success response fallback so a successful upstream write with empty/non-JSON body still returns the local generated entry id.
- Added tests for upstream auth failure preservation, upstream 5xx mapping, and success-body fallback.

Result:

Bridge repair implemented and deployed through isolated and production proof.
