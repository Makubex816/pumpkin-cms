# Cosmos Target Resource Plan

## Planning Status

The following names are recommendations/placeholders only. They must be owner-confirmed before provisioning.

## Proposed Naming Pattern

| Resource | Proposed pattern | Ice planning value | Status |
| --- | --- | --- | --- |
| Azure subscription | owner-confirmed production subscription | `OWNER_CONFIRMED_SUBSCRIPTION` | TBD |
| Resource group | `rg-{tenant-or-platform}-{environment}-cosmos` | `rg-ice-production-cosmos` | Proposed |
| Cosmos account | `cosmos-{platform}-{environment}-{region}` or `cosmos-pumpkin-prod-eastus` | `cosmos-pumpkin-prod-eastus` | Proposed |
| Database | `{platform}-{environment}-cms` | `pumpkin-prod-cms` | Proposed |
| Containers | model-aligned container names | `tenants`, `sites`, `pages`, `forms`, `mediaAssets`, `themes`, `publishRuns`, `importRuns`, `users` | Proposed |
| Region | owner-confirmed primary region | `eastus` or owner-confirmed region | TBD |

## Environment Labels

- `local-dev`: fixture/local only; no live Cosmos required.
- `staging`: future non-production Cosmos target if approved.
- `production`: Ice live CMS source target.

## Separation Strategy

Recommended initial production strategy:

- one production Cosmos account for Pumpkin CMS production workloads;
- one CMS database per environment;
- containers aligned to logical CMS model boundaries;
- tenant/site isolation through partition keys and required tenant/site fields;
- no secrets stored in Cosmos documents;
- media binaries remain in Blob storage, with MediaAsset metadata in Cosmos.

## Owner Confirmation Required

Before provisioning, the owner/operator must confirm:

- final subscription;
- final resource group;
- final account name;
- final database name;
- final container names;
- final region;
- backup policy;
- RBAC approach.
