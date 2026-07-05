# V2.8.60U Domain Manager UI Report

Status: completed.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: superadmin_domain_manager_ui_proof_no_dns_no_binding.

## V2.8.60T Carryforward

V2.8.60T delivered the live `DomainBinding` backend, API routes, and Cosmos storage container.

- Container: `DomainBinding`
- Partition key: `/tenantId`
- Airstrip tenant: `airstrip-club-las-vegas`
- Airstrip DomainBinding state: `pending_dns_records`
- DNS validation state: `pending`
- DNS/custom-domain binding remains paused.

Manual DNS packet carried forward:

| Type | Host | Name | Value |
| --- | --- | --- | --- |
| A | `@` | `airstripclublasvegas.com` | `20.118.48.17` |
| TXT | `asuid` | `asuid.airstripclublasvegas.com` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| CNAME | `www` | `www.airstripclublasvegas.com` | `app-airstrip-prod-centralus-001.azurewebsites.net` |
| TXT | `asuid.www` | `asuid.www.airstripclublasvegas.com` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |

## Implementation Summary

Implemented the SuperAdmin Admin UI layer only:

- Added `DomainBinding` API client methods in `apps/admin/src/lib/api.ts`.
- Sanitized shared Admin API client success logging so tokens and one-time keys are not logged as response payloads.
- Added SuperAdmin-only `Domains` nav entry.
- Added `/dashboard/onboarding/domains`.
- The page lists tenants, shows the Airstrip pending DomainBinding, displays the DNS packet, runs read-only DNS validation, and shows disabled future cutover controls.
- TenantAdmin nav hides Domain Manager and direct route access shows `Access Restricted`.

No Pumpkin API source or deployment change occurred.

## Build And Deploy

Admin UI validation:

- `npm --prefix apps/admin run type-check`: passed.
- `npm --prefix apps/admin run build`: passed with existing warnings only.
- Standalone POSIX ZIP: passed shape validation.
- Protected config entries in ZIP: 0.

Deployments:

- Isolated Admin UI deploy count: 1.
- Isolated deployment: `9fa0a9af-2888-4431-8690-a4e0972a9e8c`.
- Production Admin UI deploy count: 1.
- Production deployment: `3a745a66-de6c-43da-896a-7d25c9c4ba8d`.

## Browser Proof

Isolated and production browser proof both passed:

- SuperAdmin login succeeded.
- `Domains` nav was visible to SuperAdmin.
- `/dashboard/onboarding/domains` loaded.
- Ice and Airstrip tenants were visible.
- Airstrip pending DomainBinding was visible.
- DNS packet matched V2.8.60T.
- Read-only DNS validation ran and showed `pending`.
- Future Azure binding/TLS/promote/rollback controls were disabled.
- Airstrip TenantAdmin login succeeded.
- TenantAdmin nav hid `Domains`.
- TenantAdmin direct route showed `Access Restricted`.
- TenantAdmin DomainBinding API call returned HTTP 403.

## V2.8.60V Readiness

V2.8.60V Airstrip cutover is not ready until the owner adds or corrects the Bluehost DNS records and a later approved read-only DNS validation returns verified. The UI is ready to guide that phase, but this phase did not mutate DNS or bind any hostname.

## Security Boundary

No Bluehost DNS mutation, Azure custom-domain binding, nameserver change, Azure DNS zone creation, Google Workspace DNS activation, CDN/Front Door action, indexing/Search Console action, contact POST, form submission, media mutation, Airstrip/Ice content mutation, storage key/listKeys operation, SAS generation, connection string generation, Key Vault query, or Pumpkin API deploy occurred.

Secrets, passwords, bearer tokens, and cookies were not printed or written to repo reports.

## Reports

Result package:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-60u-domain-manager-ui-result/`

Durable docs:

- `deployment/architecture/pumpkin-platform/PUMPKIN_DOMAIN_MANAGER_UI_V2_8_60U.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_DOMAIN_MANAGER_AUTHZ_PROOF_V2_8_60U.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_DOMAIN_MANAGER_UI_READINESS_V2_8_60U.md`
