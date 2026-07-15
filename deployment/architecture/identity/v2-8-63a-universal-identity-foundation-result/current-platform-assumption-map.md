# Current platform assumption map

Repository scan totals are broad dependency indicators: 3,921 `tenantId`/`TenantId` references, 124 `PartitionKey` references, 67 direct `ClaimTypes.Role` references, 22 `GetUserByEmail` references, 17 `GetTenantsForUser` references, 987 backup references, and 33 runtime-key references.

| Assumption | Representative source line | Compatibility action |
|---|---|---|
| A user belongs to one tenant | `apps/pumpkin-net-models/Models/User.cs:6` | Preserve `User.TenantId`; add global `UserAccount` plus many `TenantMembership` records. |
| Tenant role is global user state | `apps/pumpkin-net-models/Models/User.cs:12` | Preserve legacy role; new global role is only SuperAdmin and tenant roles live on memberships. |
| User partition equals mutable slug | `apps/pumpkin-net-models/Models/User.cs:19` | New membership/contact/alias/job records partition on immutable `tenantUid`. |
| JWT carries one tenant slug and role | `apps/pumpkin-api/Program.cs:703-704` | Future tokens carry user ID, global role, active tenant UID, membership ID, and session version; authoritative checks remain required. |
| Login lookup is email-only legacy User | `apps/pumpkin-api/Program.cs:676`; `Services/IDatabaseService.cs:101` | Add normalized globally unique UserAccount lookup; legacy lookup remains during dual read. |
| Tenant visibility derives from one user tenant | `apps/pumpkin-api/Program.cs:989`; `Services/IDatabaseService.cs:45` | Add membership enumeration and active-tenant switching. |
| Tenant contact is embedded in Tenant | `apps/pumpkin-net-models/Models/Tenant.cs:51` | Preserve fallback; add independently verified `TenantContactSettings`. |
| Content identity uses slug | `Page.cs:19`, `FormDefinition.cs:11`, `FormEntry.cs:23`, `Theme.cs:24`, `MediaAsset.cs:11`, `DomainBinding.cs:11`, `TenantRedirect.cs:11` | Legacy fields remain; resolver/alias/dual-read contracts allow later UID backfill without moving data. |
| Provider queries implement legacy identity separately | `CosmosDataConnection.cs:1160,2231`; `MongoDataConnection.cs:759,1249` | One provider-neutral identity contract declares equal unique keys, indexes, partitions, audit and soft-delete semantics. |
| Admin tenant selector uses slug | `apps/admin/src/components/TenantSelector.tsx:89-151` | Existing selector stays operational; identity client adds membership-based switch endpoint. |
| Provisioning assumes one email/tenant/role | `TenantAdminUserProvisioning.cs:17,86`; `UserProfileManagement.cs:9,130` | Dry-run groups normalized emails and holds duplicates instead of silently merging. |

Other audited dependency classes: record IDs, fixture/preview/custom-host paths, runtime setting names, storage namespaces, imports/publishes, redirects/domains, media aliases, backup manifests, onboarding compilers, hardcopies/registers, DNS operations metadata, password reset/change behavior, session invalidation, and FormEntry/form-recipient separation. Each is an explicit rename preflight or dry-run dependency category.
