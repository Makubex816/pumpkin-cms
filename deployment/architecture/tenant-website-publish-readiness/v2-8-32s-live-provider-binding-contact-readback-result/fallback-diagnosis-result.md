# Fallback Diagnosis Result

Fallback classification: `provider_binding_not_active`.

What was ruled out or not reached:

- `provider_connection_string_invalid_shape`: ruled out. Shape contained `AccountEndpoint` plus key/token material.
- `rbac_unresolved`: ruled out. Appsetting mutation succeeded.
- `provider_appsetting_names_not_discovered`: ruled out for configurable connection/database/JWT settings. No configurable FormEntry container setting exists in source.
- `provider_store_access_failed_after_binding`: not reached because login was not attempted after health gate failure.
- `admin_auth_still_insufficient`: not reached because no bearer token was issued.
- `persistence_readback_not_found`: not reached because no POST was sent.

Source nuance:

The current local health handler is dependency-light and returns `providerConfigured:false` and `providerStatus:"not_checked"` as fixed fields. Because V2.8.32S explicitly required stopping when `providerConfigured` remains false, the phase stopped before login even though appsetting mutation succeeded.

