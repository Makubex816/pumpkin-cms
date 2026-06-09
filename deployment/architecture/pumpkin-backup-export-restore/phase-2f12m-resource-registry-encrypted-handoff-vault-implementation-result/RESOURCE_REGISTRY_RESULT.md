# Resource Registry Result

The redacted registry generator writes:

- `REDACTED_RESOURCE_REGISTRY.json`
- `RESOURCE_REGISTRY_SUMMARY.md`
- `RESOURCE_TO_TENANT_MAP.md`
- `RUNTIME_PROFILE_MAP.md`

Bootstrap validation result:

- `.tmp/redacted-registry`: passed

The initial fixture includes non-secret resource names for the Ice future Cosmos target, including:

- `rg-ice-production-cosmos`
- `cosmos-pumpkin-prod-eastus`
- `pumpkin-prod-cms`
- model-aligned Cosmos container names

It includes credential references and runtime profile mappings, but no plaintext credential values.
