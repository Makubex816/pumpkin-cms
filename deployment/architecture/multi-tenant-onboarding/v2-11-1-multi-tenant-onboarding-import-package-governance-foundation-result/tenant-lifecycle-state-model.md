# Tenant Lifecycle State Model

Canonical V2.11 states:

| State | Meaning | Mutation allowed in V2.11.1 |
| --- | --- | --- |
| `candidate` | Tenant is being evaluated. | No |
| `paused` | Tenant is intentionally not being changed. | No |
| `local_package_ready` | Local package has required fields and references. | No |
| `local_import_validated` | Local no-write validators passed. | No |
| `backup_verified` | Backup Center prerequisite references passed. | No |
| `resource_registry_bound` | Resource Registry and Provider Profile references are resolved. | No |
| `runtime_qa_ready` | Runtime QA prerequisites are satisfied. | No |
| `staging_ready` | Future staging gate could be requested. | No |
| `live_readonly_ready` | Future live read-only gate could be requested. | No |
| `live_write_approved` | Future explicit write approval exists. | No |
| `production_published` | Tenant has published production evidence. | No |
| `archived` | Tenant is no longer active. | No |

Transition rule:

Every transition that could write data, deploy, mutate DNS/custom domains, submit forms, request indexing, touch protected config, or mutate Azure requires a separate explicit approval naming tenant, target system, action, rollback/abort owner, and hard stops.

Known tenant states:

- `ice-rink-rentals`: `production_published`, active proof tenant, indexing deferred.
- `roller-rink-rentals`: `paused`, resume not approved.
