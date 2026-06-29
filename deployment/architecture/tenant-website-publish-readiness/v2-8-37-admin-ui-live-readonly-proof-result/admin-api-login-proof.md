# Admin API Login Proof

Endpoint:

`POST /api/auth/login`

Result:

- Login attempted using approved secure file values in memory.
- HTTP status: 200.
- Bearer token returned: yes.
- Token was not printed or written.
- Authenticated tenant matched `ice-rink-rentals`: true.
- Public-safe role summary: `TenantAdmin`.

Classification:

`admin_api_login_proof_passed`.
