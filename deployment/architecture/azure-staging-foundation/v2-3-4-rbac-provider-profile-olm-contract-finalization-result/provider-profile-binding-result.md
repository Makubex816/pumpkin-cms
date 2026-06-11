# Provider Profile Binding Result

Provider profile candidate created:

```text
provider-profile-binding-candidate.json
```

| Field | Value |
| --- | --- |
| Provider profile ID | `olm-staging-cosmos-nosql-v1` |
| Provider type | `azure-cosmos-nosql` |
| Provider mode | `live-write-approved` |
| Environment | `staging` |
| Account reference | `resource-registry:pumpkincms-olm-staging-cosmos` |
| Database | `pumpkincms-olm-staging` |
| Partition key | `/tenantKey` |
| Credential reference | `credential-reference-olm-staging-cosmos-entra-rbac-no-value` |
| Credential values included | `false` |

Validation:

- Provider profile validation: passed.
- Profile is candidate-only and not globally activated.
- `canPerformLiveWrites` remains `false`.
- Future first-write approval is still required.

