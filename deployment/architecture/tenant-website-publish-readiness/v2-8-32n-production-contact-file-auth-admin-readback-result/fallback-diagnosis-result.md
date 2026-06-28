# Fallback Diagnosis Result

Fallback classification: `readback_auth_invalid_or_insufficient`.

Diagnosis matrix:

- `auth_file_missing`: no. The approved auth file exists.
- `auth_file_not_ignored`: no. The approved auth file is covered by `.gitignore`.
- `health_preflight_failed`: no. Pumpkin API and static contact health passed.
- `static_contact_health_failed`: no. Static contact health returned HTTP `200`, JSON `ok:true`.
- `frontend_endpoint_mismatch`: no. Contact page serialized `/api/static-contact`, did not serialize `/api/contact`, and contained the expected public email.
- `readback_auth_invalid_or_insufficient`: yes. Authenticated Admin FormEntry readback returned HTTP `401`.
- `static_contact_post_failed`: not reached. No POST was sent.
- `persistence_readback_not_found`: not reached. No POST was sent.

Operational conclusion:

The file-injected auth value was present but did not authorize the approved Admin FormEntry readback route. Provide an auth value that is valid for `GET /api/admin/ice-rink-rentals/form-entries`, then rerun the same bounded gate. Do not print or write the auth value.

