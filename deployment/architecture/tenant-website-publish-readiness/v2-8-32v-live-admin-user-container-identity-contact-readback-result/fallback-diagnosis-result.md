# Fallback Diagnosis Result

Fallback classification: `admin_login_failed_http_500_after_identity_repair`.

Ruled out or advanced:

- `admin_identity_container_not_found`: resolved. `User` container exists with `/tenantId`.
- `admin_identity_conflict`: ruled out. Exactly one approved email/tenant record is present.
- `admin_login_unauthorized_after_identity_repair`: ruled out for this run. Login no longer returns 401; it returns 500.

Likely next blocker:

Source-backed JWT support settings are missing. V2.8.32T redacted appsetting verification showed:

- `Jwt__Issuer`: absent.
- `Jwt__Audience`: absent.
- `Jwt__ExpirationMinutes`: absent.

V2.8.32V was not approved to mutate appsettings, so these were not repaired.

