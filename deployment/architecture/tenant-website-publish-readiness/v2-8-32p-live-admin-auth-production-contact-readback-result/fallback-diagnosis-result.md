# Fallback Diagnosis Result

Fallback classification: `saved_jwt_invalid_and_admin_jwt_secret_value_missing`.

Diagnosis matrix:

- `secure_file_missing_or_not_ignored`: no. Both approved secure files existed and were ignored.
- Saved JWT usable: no. Admin FormEntry readback returned HTTP `401`.
- JWT binding file usable: no. `adminJwtSecretValue` was missing.
- `rbac_unresolved`: not reached. No Azure mutation was attempted.
- `live_admin_login_failed`: not reached. Login was not attempted.
- `admin_auth_still_insufficient`: yes for the saved JWT path only; binding/login path was not reached.
- `health_preflight_failed`: not reached after auth resolution because no auth path succeeded.
- `static_contact_health_failed`: not reached.
- `frontend_endpoint_mismatch`: not reached.
- `static_contact_post_failed`: not reached. No POST was sent.
- `persistence_readback_not_found`: not reached. No POST was sent.

Operational conclusion:

Provide either a saved JWT file that returns 2xx for Admin FormEntry readback, or a corrected binding file with non-empty `adminJwtSecretValue` for setting `Jwt__SecretKey`. Keep the same hard stop: no production POST until authenticated Admin readback preflight returns 2xx.

