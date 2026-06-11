# Resource Registry Binding Result

Status: passed for non-secret candidate review.

V2.3.4 created the current Resource Registry binding candidate:

```text
deployment/architecture/azure-staging-foundation/v2-3-4-rbac-provider-profile-olm-contract-finalization-result/resource-registry-binding-candidate.json
```

The candidate contains non-secret staging identifiers for:

- staging resource group
- Cosmos account and database
- OLM containers
- Storage account and staging evidence containers
- managed identity
- diagnostics resources
- credential reference IDs without values

No keys, connection strings, SAS, tokens, cookies, auth headers, or Key Vault secret values are included.
