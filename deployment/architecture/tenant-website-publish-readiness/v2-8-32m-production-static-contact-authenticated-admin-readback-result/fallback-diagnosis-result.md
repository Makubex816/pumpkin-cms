# Fallback Diagnosis Result

Fallback classification: `readback_custom_header_env_missing`.

Diagnosis matrix:

- `health_preflight_failed`: no. Pumpkin API and static contact health passed.
- `static_contact_health_failed`: no. Static contact health returned HTTP `200`, JSON `ok:true`.
- `frontend_endpoint_mismatch`: no. Contact page serialized `/api/static-contact`, not `/api/contact`.
- `readback_auth_missing`: yes, custom-header env was incomplete.
- `readback_custom_header_env_missing`: yes.
- `readback_auth_invalid_or_insufficient`: not reached. No authenticated custom-header request could be constructed.
- `static_contact_post_failed`: not reached. No POST was sent.
- `persistence_readback_not_found`: not reached. No POST was sent and no entry was available for readback.

Operational conclusion:

Set `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME` and `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE` in the runtime environment, keep `PUMPKIN_FORMENTRY_READBACK_AUTH_MODE=custom-header`, and rerun the same bounded gate. Do not print or write the auth value.
