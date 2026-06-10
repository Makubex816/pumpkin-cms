# Cosmos Database Proof Summary

Status: complete

Provisioning and readback:

- Cosmos account: `cosmos-pumpkin-prod-eastus`.
- Resource group: `rg-ice-production-cosmos`.
- Database: `pumpkin-prod-cms`.
- Approved containers: 10.
- Partition key: `/tenantKey`.
- Backup policy: continuous, 30-day tier.

Seed/readback proof:

| Field | Result |
| --- | --- |
| Source phase | 2F-12Q |
| Seed status | `seeded-and-verified` |
| Expected documents | 27 |
| Created documents | 23 |
| Matching existing documents skipped | 4 |
| Conflicts | 0 |
| Failed writes | 0 |
| Readback status | passed |

Live export proof:

| Field | Result |
| --- | --- |
| Source phase | 2F-12R |
| Export mode | `live-readonly-portable-json` |
| Auth mode | Azure AD/RBAC |
| Record sets | 10 |
| Total records | 27 |
| Validation | passed |
| Export manifest SHA-256 | `FE415D249BD17EF3CC0E4B027A5530E8247C4E96E8CD4E6EA3C62FC8B1AFD14F` |

Record counts:

| Collection | Count |
| --- | ---: |
| tenants | 1 |
| sites | 1 |
| pages | 3 |
| routes | 5 |
| forms | 3 |
| mediaAssets | 12 |
| themes | 1 |
| publishRuns | 0 |
| importRuns | 1 |
| users | 0 |
| total | 27 |

12T boundary:

No Cosmos calls were run in 12T. This summary consolidates prior approved evidence only.
