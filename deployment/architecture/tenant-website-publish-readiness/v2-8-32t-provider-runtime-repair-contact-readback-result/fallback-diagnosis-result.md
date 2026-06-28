# Fallback Diagnosis Result

Fallback classification: `admin_login_unauthorized_after_provider_binding`.

Ruled out or advanced:

- `provider_connection_string_invalid_shape`: ruled out. Shape check passed.
- `provider_binding_not_active`: advanced. Redacted appsetting verification matched secure values, and login no longer throws the provider exception.
- `health_provider_configured_false`: diagnosed as source-defective because source hardcodes false.
- `rbac_unresolved`: not present. No T mutation was required, and S mutation had succeeded.
- `source_hotfix_required_for_provider_binding`: not present. Provider-backed login path is active.

Remaining blocker:

HTTP 401 from login means the Admin user is missing, inactive, or the provided password does not match the stored BCrypt hash. V2.8.32T did not have a source-discovered Admin seed/repair API path to resolve that state.

Latent blocker:

`Jwt__Issuer`, `Jwt__Audience`, and `Jwt__ExpirationMinutes` are absent by boolean-only appsetting check. Login did not reach JWT generation, so these are not the active blocker yet.

