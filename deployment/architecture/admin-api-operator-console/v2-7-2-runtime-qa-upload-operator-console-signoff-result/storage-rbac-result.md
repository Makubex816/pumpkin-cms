# Storage RBAC Result

Status: `passed`

RBAC assignment:

- Role: `Storage Blob Data Contributor`
- Principal: current Azure user principal, redacted in committed docs
- Resource group: `rg-pumpkincms-stg-eastus-olm`
- Storage account: `pumpkincmsstgolm01`
- Container: `runtime-qa-staging`
- Scope type: container resource scope
- Assignment created: yes

Safety:

- No subscription-wide role was assigned.
- No Owner or Contributor role was assigned.
- No Key Vault role was assigned.
- No Cosmos role was assigned.
- No production resource was targeted.
- No storage key, connection string, or SAS was used.

An initial blob list retry failed while RBAC propagated. After propagation, blob list succeeded through Azure Identity/RBAC.
