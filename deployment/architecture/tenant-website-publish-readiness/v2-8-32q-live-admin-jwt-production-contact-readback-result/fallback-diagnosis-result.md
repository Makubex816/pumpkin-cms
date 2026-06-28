# Fallback Diagnosis Result

Fallback classification: `live_admin_login_failed_http_500`.

Diagnosis matrix:

- `secure_file_missing_or_not_ignored`: no. The approved secure file existed and was ignored.
- `adminJwtSecretValue_missing`: no. The corrected secure file included a non-empty value.
- `rbac_unresolved`: no. The approved `Jwt__SecretKey` setting mutation succeeded.
- `health_preflight_failed`: no. Pumpkin API `/health` and `/api/health` returned HTTP `200`.
- `live_admin_login_failed`: yes. `POST /api/auth/login` returned HTTP `500`.
- `admin_auth_still_insufficient`: not reached. No bearer token was issued.
- `static_contact_health_failed`: no. Static contact health returned HTTP `200`.
- `frontend_endpoint_mismatch`: no. Contact page serialized `/api/static-contact`, did not serialize `/api/contact`, and contained the expected public email.
- `static_contact_post_failed`: not reached. No POST was sent.
- `persistence_readback_not_found`: not reached. No POST was sent.

Source-informed note:

The login source also references `Jwt:Issuer`, `Jwt:Audience`, and `Jwt:ExpirationMinutes`. Those settings were not inspected or mutated in V2.8.32Q because the approval allowed setting only `Jwt__SecretKey` and prohibited appsettings list/show and protected config reads. The observed blocker remains the live login HTTP `500`.

