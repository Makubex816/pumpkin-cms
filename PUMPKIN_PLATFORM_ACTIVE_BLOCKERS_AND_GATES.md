# Pumpkin Platform Active Blockers And Gates

## Current V2 Gate Summary

| Gate | Status | V2 refs | Required unblock |
| --- | --- | --- | --- |
| Azure staging foundation inventory and IaC package | Complete | V2.3.1 / L07 / L09 / L11 / L12 | No-deploy package created; no Azure mutation performed. |
| Azure staging creation and binding validation | Complete, blocked before mutation | V2.3.2 / L07 / L09 / L11 / L12 | V2.3.1 values were candidate/example-level; no resources created. |
| Azure staging final parameter worksheet and creation retry | Complete | V2.3.3 / L07 / L09 / L11 / L12 | Staging resource group and resource foundation created; RBAC skipped. |
| Azure staging RBAC/profile/OLM contract finalization | Complete | V2.3.4 / L07 / L08 / L09 / L11 / L12 | Staging DB-scoped Cosmos RBAC assigned; provider profile and Resource Registry candidates created; OLM contract passed. |
| First scoped OLM staging write gate | Blocked before write | V2.2.1 / L08 / L12 | Repo-supported live Cosmos data-plane writer/readback adapter is unavailable. |
| OLM real staging provider target | Ready, executor missing | V2.2 / V2.3 / V2.5 | Use `olm-staging-cosmos-nosql-v1` only under the next explicit adapter/write approval. |
| OLM readback/rollback | Blocked by missing live readback adapter | V2.2 / V2.4 / V2.9 | Methods are defined, but a repo-supported Cosmos readback adapter must exist before execution. |
| Azure resource creation/mutation | Closed | V2.3 / L11 | Separate explicit approval required. |
| RBAC assignment | Complete for V2.3.4 staging database scope | V2.3 / L11 / L12 | Future RBAC changes require separate explicit approval. |
| Production database migration | Closed | V2.9 / L12 | Future explicit production migration approval only. |
| Production provider writes | Closed | V2.9 / L12 | Future explicit production write approval only. |
| CMS writes | Closed | L04 / L12 | Separate scoped approval required. |
| Deployment/indexing/publication | Closed | V2.8 / V2.9 / L15 | Separate deploy/index/publish approval required. |

## Remaining OLM Staging Execution Blockers

- Implement a repo-supported Azure Cosmos NoSQL data-plane writer/readback adapter using Azure Identity/RBAC only.
- Preserve local/offline and staging-simulated profiles while adding the live staging adapter.
- Keep `production-runtime` blocked and keep live-write-approved scoped to `olm-staging-cosmos-nosql-v1`.
- Revalidate Backup Center and Runtime QA evidence before any retry.
- Verify Cosmos data-plane RBAC propagation through the repo readback adapter before writing.

## Resolved Or Supplyable OLM Staging Resource Values

- `OLM_STAGING_PROVIDER_TYPE`: `azure-cosmos-nosql`
- `OLM_STAGING_PROVIDER_PROFILE_ID`: `olm-staging-cosmos-nosql-v1`
- `OLM_STAGING_PROVIDER_MODE`: `live-write-approved`
- `OLM_STAGING_RESOURCE_SCOPE`: `resourceGroup:rg-pumpkincms-stg-eastus-olm`
- `OLM_STAGING_ACCOUNT_OR_HOST`: `cosmos-pumpkincms-stg-olm01.documents.azure.com`
- `OLM_STAGING_DATABASE_OR_NAMESPACE`: `pumpkincms-olm-staging`
- `OLM_STAGING_RBAC_OR_AUTH_MODE`: `cosmos-nosql-data-plane-rbac`
- `OLM_STAGING_IDENTITY_OR_SESSION_TYPE`: `operator-azure-cli-session+managed-identity`
- `OLM_STAGING_READBACK_METHOD`: `cosmos-nosql-tenant-site-batch-id-readback`
- `OLM_STAGING_ROLLBACK_METHOD`: `cosmos-nosql-first-write-batch-delete-by-batch-id`

## Immutable Safety Facts

- Legacy 2H Tracker v1 frozen value: `92 / 100`
- OLM approval manifest: `olapprove_508df3f03faa4f80`
- OLM first-write batch: `olbatch_b08e184fdc6565aa`
- Expected OLM staging package records: `48`
- OLM records written: `0`
- Real OLM write readback run: `false`
- V2.0 Azure resources created: `0`
- V2.0 Azure resources mutated: `0`
- V2.0 RBAC assignments: `0`
- V2.3.1 Azure resources created: `0`
- V2.3.1 Azure resources mutated: `0`
- V2.3.1 RBAC assignments: `0`
- V2.3.1 staging writes: `0`
- V2.3.2 Azure resources created: `0`
- V2.3.2 Azure resources mutated: `0`
- V2.3.2 RBAC assignments: `0`
- V2.3.2 staging writes: `0`
- V2.3.3 Azure staging resource group created/updated: `1`
- V2.3.3 Azure staging foundation deployment: `Succeeded`
- V2.3.3 RBAC assignments: `0`
- V2.3.3 OLM staging writes: `0`
- V2.3.4 Cosmos data-plane RBAC assignments: `2`
- V2.3.4 Storage RBAC assignments: `0`
- V2.3.4 Key Vault RBAC assignments: `0`
- V2.3.4 OLM staging contract validation: `passed`
- V2.3.4 OLM staging writes: `0`
- V2.2.1 pre-write target/RBAC/package checks: `passed`
- V2.2.1 live-write-approved executor gate: `blocked`
- V2.2.1 OLM staging writes: `0`
- V2.2.1 readback run: `false`
