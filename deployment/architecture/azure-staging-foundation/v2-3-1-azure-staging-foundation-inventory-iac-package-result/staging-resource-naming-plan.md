# Staging Resource Naming Plan

These names are proposal candidates only. They are not live targets until a future approval confirms creation or maps to an existing safe staging resource.

| Resource | Proposed name pattern | Example candidate | Notes |
| --- | --- | --- | --- |
| Resource group | `rg-pumpkincms-stg-<region>-olm` | `rg-pumpkincms-stg-eastus-olm` | Do not reuse Ice production resource groups. |
| Cosmos account | `cosmos-pumpkincms-stg-<region>-<suffix>` | `cosmos-pumpkincms-stg-eastus-olm` | Must be globally unique; suffix may be required. |
| Cosmos database | `pumpkin-olm-staging` | `pumpkin-olm-staging` | Non-production namespace only. |
| Storage account | `pumpkincmsstg<suffix>` | `pumpkincmsstgolm01` | Lowercase alphanumeric, globally unique. |
| Blob container: backups | `backup-center-staging` | `backup-center-staging` | Stores future staging evidence only. |
| Blob container: registry | `resource-registry-staging` | `resource-registry-staging` | Stores redacted registry snapshots only. |
| Blob container: runtime QA | `runtime-qa-staging` | `runtime-qa-staging` | Stores approved future evidence only. |
| Key Vault | `kv-pumpkincms-stg-<suffix>` | `kv-pumpkincms-stg-olm01` | Secret references only; no secret values in repo. |
| User-assigned identity | `id-pumpkincms-olm-stg` | `id-pumpkincms-olm-stg` | Optional if operator Azure CLI session is not the chosen first-write identity. |
| Log Analytics workspace | `log-pumpkincms-stg-<region>` | `log-pumpkincms-stg-eastus` | Optional hardening resource. |
| Application Insights | `appi-pumpkincms-stg-olm` | `appi-pumpkincms-stg-olm` | Optional hardening resource. |
| Budget / cost alert | `budget-pumpkincms-stg-monthly` | `budget-pumpkincms-stg-monthly` | Recommended before resource creation. |

## Tag Plan

Required future tags:

- `project`: `PumpkinCMS`
- `environment`: `staging`
- `lane`: `OutboundLinkManager`
- `owner`: operator-approved owner alias
- `costCenter`: operator-approved cost center or `unassigned`
- `createdByPhase`: future approved creation phase, not V2.3.1
- `liveWriteScope`: `staging-only`

## Non-Production Rules

- Names must not include `prod`, `production`, or existing Ice production resource group names.
- Names must not encode secrets, tenant IDs, subscription IDs, user identities, or credential hints.
- Names must be operator-reviewed before any Azure creation approval.

