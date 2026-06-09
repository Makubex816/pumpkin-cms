# Redacted Resource Registry

`create-redacted-registry` writes:

- `REDACTED_RESOURCE_REGISTRY.json`
- `RESOURCE_REGISTRY_SUMMARY.md`
- `RESOURCE_TO_TENANT_MAP.md`
- `RUNTIME_PROFILE_MAP.md`

The registry includes resource identity, tenant mappings, runtime profiles, credential reference IDs, status, owner, rotation, cleanup, and safe process-env presence metadata.

Allowed process env values in the registry:

- `PUMPKIN_API_URL`, as non-secret URL metadata when present
- `ROLLER_RINK_RENTALS_TENANT_ID`, as non-secret tenant metadata when present

Blocked from the registry:

- API keys
- JWTs
- connection strings
- SAS URLs
- auth headers
- cookies
- private keys
- protected config values

`PUMPKIN_ADMIN_JWT` is represented only by presence and exclusion status.
