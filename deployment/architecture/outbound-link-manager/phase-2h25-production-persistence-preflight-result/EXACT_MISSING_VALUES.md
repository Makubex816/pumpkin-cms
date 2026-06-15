# Exact Missing Values

Required before any production execution:

| Missing value | Why it is required |
| --- | --- |
| productionProviderProfileId | Needed to identify the approved production persistence profile. |
| productionProviderMode | Needed to distinguish no-write dry-run from future execution. |
| productionTargetName | Needed to bind the approval manifest to one production target. |
| approved production resourceGroupOrScope | Needed for target and RBAC scope validation. |
| approved production accountOrHostName | Needed for provider-state/readback validation. |
| approved production authMode | Needed to prove no keys/listKeys, connection strings, or SAS are required. |
| approved production identityOrSessionType | Needed to prove safe operator/app session readiness. |
| Backup Center production evidence reference | Needed before any production write. |
| Resource Registry production binding reference | Needed before target/profile execution. |
| operator production execution approval reference | Needed to cross the future execution boundary. |

Candidate values that exist but are not sufficient:

- `resource-registry:cosmos-pumpkin-prod-eastus`
- `pumpkin-prod-cms`
- `credential-reference-outbound-link-production-no-value`
- `production-candidate`
- `local-to-production-dry-run`
