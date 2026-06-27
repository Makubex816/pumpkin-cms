# Unresolvable Classification

Resolved in H:

`deployment_server_side_http_400_due_to_windows_zip_entry_paths`

Still unresolved after the corrected deployment:

`runtime_health_500_requires_separate_startup_secret_or_auth_configuration_diagnostics`

Basis:

- The corrected deployment succeeded with `RuntimeSuccessful`.
- Both dependency-light health routes returned HTTP `500`.
- Local source shows health handlers do not read provider configuration.
- Local source also shows global authentication is registered before health endpoints, and JWT bearer setup dereferences `Jwt:SecretKey`.

H could not inspect or bind secret app settings, read protected config, or perform a second deployment. Therefore the remaining health blocker is classified for a follow-up approval.
