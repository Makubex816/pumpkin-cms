# Admin API Login Proof

Approved secure file:

`.tmp/v2-8-37/secure/admin-ui-live-proof.json`

The Admin login request used the source-confirmed payload shape:

- `email`
- password field supplied from the secure file in process memory only

Result:

- Login status: HTTP 200.
- Token received: true.
- Token printed: false.
- Password printed: false.
- User role: `TenantAdmin`.
- User tenant matched expected tenant: true.

Classification:

`admin_api_login_succeeded_token_redacted`
