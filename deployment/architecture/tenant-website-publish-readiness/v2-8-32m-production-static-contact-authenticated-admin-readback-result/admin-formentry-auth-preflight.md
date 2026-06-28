# Admin FormEntry Auth Preflight

Admin FormEntry read URL: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/admin/ice-rink-rentals/form-entries`

Configured readback auth mode: `custom-header`.

Required request shape:

- Header name: value of `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME`.
- Header value: value of `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE`.

Observed env readiness:

- `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME` present: no.
- `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE` present: no, redacted.

Preflight result: not sent.

Reason: the required custom-header env values were missing, so the authenticated request could not be constructed safely.

Security result:

- Auth value printed: no.
- Auth value written: no.

Fallback impact:

- `readback_custom_header_env_missing`: yes.
- `readback_auth_invalid_or_insufficient`: not reached.
