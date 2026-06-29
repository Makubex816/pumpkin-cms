# Cosmos Database Container Inventory

## Production Account

- Account: `cosmos-pumpkin-prod-eastus`.
- Resource group: `rg-ice-production-cosmos`.
- Region: East US.
- Kind: GlobalDocumentDB.
- Public network access: Enabled.
- Automatic failover: true.
- Backup policy: Continuous, `Continuous30Days`.
- Database: `pumpkin-prod-cms`.

Production containers:

| Container | Partition key | Notes |
| --- | --- | --- |
| `FormEntry` | `/tenantId` | Proven contact/Admin readback lane |
| `Tenant` | `/tenantId` | Proven key rotation lane |
| `User` | `/tenantId` | Admin auth lane container |
| `forms` | `/tenantKey` | Provider metadata/future-target container |
| `importRuns` | `/tenantKey` | Lower/plural future-target container |
| `mediaAssets` | `/tenantKey` | Lower/plural future-target container |
| `pages` | `/tenantKey` | Lower/plural future-target container |
| `publishRuns` | `/tenantKey` | Lower/plural future-target container |
| `routes` | `/tenantKey` | Provider metadata/future-target container |
| `sites` | `/tenantKey` | Provider metadata/future-target container |
| `tenants` | `/tenantKey` | Provider metadata/future-target container |
| `themes` | `/tenantKey` | Lower/plural future-target container |
| `users` | `/tenantKey` | Provider metadata/future-target container |

## OLM Staging Account

- Account: `cosmos-pumpkincms-stg-olm01`.
- Resource group: `rg-pumpkincms-stg-eastus-olm`.
- Database: `pumpkincms-olm-staging`.
- Backup policy: Periodic, 240-minute interval, 8-hour retention, Geo redundancy.

Staging containers include outbound-link audit logs, bulk actions, instances, policies, render decisions, review decisions, rollback plans, links, scan runs, and trace logs.
