# Fallback Diagnosis Result

Fallback classification: `secure_file_missing_required_admin_jwt_secret_value`.

Diagnosis matrix:

- `secure_file_missing_or_not_ignored`: no. The secure file exists and is ignored.
- `admin_auth_setting_name_not_discovered`: no. Source discovery found `Jwt:SecretKey` and Azure app-setting name `Jwt__SecretKey`.
- `secure_file_missing_required_admin_jwt_secret_value`: yes. The secure file did not include a value for `adminJwtSecretValue`.
- `rbac_unresolved`: not reached. No Azure mutation was attempted.
- `live_admin_login_failed`: not reached. Login was not attempted.
- `admin_auth_still_insufficient`: not reached. No login token existed for readback.
- `health_preflight_failed`: not reached after binding because no binding occurred.
- `static_contact_health_failed`: not reached.
- `frontend_endpoint_mismatch`: not reached.
- `static_contact_post_failed`: not reached. No POST was sent.
- `persistence_readback_not_found`: not reached. No POST was sent.

Operational conclusion:

Provide a new approved secure handoff file that includes a non-empty `adminJwtSecretValue` for binding the source-discovered `Jwt__SecretKey` setting, then rerun the same bounded gate. Do not print or write the secret value.

