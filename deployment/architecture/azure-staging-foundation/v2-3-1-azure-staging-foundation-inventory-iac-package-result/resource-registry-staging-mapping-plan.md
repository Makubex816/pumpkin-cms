# Resource Registry Staging Mapping Plan

The Resource Registry should receive a redacted staging target candidate after resource creation or approved existing-target mapping. V2.3.1 does not write registry data to a live service.

| Registry entry | Proposed source | Required metadata | Secret handling |
| --- | --- | --- | --- |
| Staging resource group | IaC output or approved existing scope | Name, location, tags, purpose, owner | No subscription IDs required in committed docs. |
| Cosmos account | IaC output or approved existing account | Account name, endpoint host, API type, database name | No keys, connection strings, or tokens. |
| Cosmos database | IaC output | Database name, container list, partition key | No document data export. |
| Cosmos containers | IaC output | Container names and `/tenantKey` partitioning | No records exported. |
| Storage account | IaC output | Account name, containers, evidence purpose | No keys, connection strings, or SAS. |
| Key Vault | IaC output | Vault name, RBAC mode, secret reference names only | No secret values. |
| Managed identity | IaC output or identity plan | Identity name and intended scope | No credentials. |
| RBAC assignments | Future RBAC approval result | Role display names/scopes/principal labels | No token or object secret values. |
| Diagnostics | IaC output | Workspace/App Insights names | No telemetry secrets. |
| Budget/cost alert | Future approval result | Budget name, amount category, contact owner | No billing secrets. |

## Registry Readiness Rules

- Mark all entries as `candidate` until resources are created and read back under an approved phase.
- Mark secrets as `credentialReferenceOnly`.
- Do not copy session JWTs, Azure tokens, cookies, connection strings, keys, SAS, or private keys into durable registry artifacts.
- Require a Resource Registry review before changing the first-write blocker from unresolved to ready.

