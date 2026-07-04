# Domain Handling Source Audit

Status: completed.

## Tenant Model

Reviewed:

- `apps/pumpkin-net-models/Models/Tenant.cs`
- `packages/pumpkin-ts-models/src/models/Tenant.ts`

Findings:

- Tenant records contain identity, plan, status, credential metadata, settings, contact, and billing.
- `TenantSettings.allowedOrigins` is present and used for browser CORS allowlisting.
- There is no first-class domain binding lifecycle, DNS packet ledger, hostname binding state, TLS state, canonical promotion state, or rollback/audit history.

Decision:

- Do not overload `allowedOrigins` as the public domain manager.
- Keep CORS origin management as a separate tenant setting.
- Add a sidecar `DomainBinding` model in a future implementation phase.

## API Surface

Reviewed:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/IDataConnection.cs`
- `apps/pumpkin-api/Services/DatabaseService.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/TenantCorsPolicyProvider.cs`

Findings:

- Admin tenant routes already require authenticated JWT access.
- Create, update, delete, tenant lookup, credential rotation, tenant-admin provisioning, and user management use explicit SuperAdmin checks.
- Non-SuperAdmin users are limited to their tenant scope for most content operations.
- Cosmos access is container-specific and tenant-partitioned for tenant records.

Decision:

- Future domain binding routes should follow the existing Minimal API style and explicit SuperAdmin role checks.
- Future storage should add methods to the data access interfaces rather than embedding custom logic in endpoints.

## Admin UI

Reviewed:

- `apps/admin/src/app/dashboard/layout.tsx`
- `apps/admin/src/app/dashboard/onboarding/page.tsx`
- `apps/admin/src/app/dashboard/tenants/page.tsx`
- `apps/admin/src/components/ProtectedRoute.tsx`
- `apps/admin/src/components/TenantSelector.tsx`
- `apps/admin/src/contexts/AuthContext.tsx`
- `apps/admin/src/lib/api.ts`

Findings:

- Dashboard navigation already supports role-filtered SuperAdmin nav items.
- Onboarding and tenant pages already block non-SuperAdmin users.
- Tenant selection is stored client-side and loaded from `/api/admin/tenants`.
- Tenant editing currently includes allowed origins but no domain lifecycle workflow.

Decision:

- Add a new SuperAdmin-only domain manager under onboarding and optionally under tenant detail routes.
- TenantAdmin should not see or call domain-binding controls.

## Tenant Package Domain Schema

Reviewed:

- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/schemas/domains.schema.json`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/ice-rink-rentals/domains.json`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/blank-tenant-template/domains.json`

Findings:

- The package schema has `tenantId`, `primaryHost`, `hosts`, `dnsApproved`, and `indexingApproved`.
- Additional fields are allowed.
- This is enough for intake and validation, but not enough for runtime binding state.

Decision:

- Keep package domains as source/intake metadata.
- Use `DomainBinding` as the runtime lifecycle ledger.

## Page, Publish, Media, Form, Theme Surfaces

Reviewed:

- `apps/pumpkin-net-models/Models/Page.cs`
- `apps/pumpkin-net-models/Models/PublishRun.cs`
- `apps/pumpkin-net-models/Models/MediaAsset.cs`
- form and theme route patterns through Admin API.

Findings:

- Pages include SEO canonical fields and `domainRouting`.
- Publish runs include `domain`, deployment target, and deployment status.
- Media assets are tenant/site scoped and should survive domain changes.
- Forms, themes, and pages are tenant scoped and should not be rewritten merely to bind a domain.

Decision:

- Domain manager promotion may update canonical/public routing metadata only through a later explicit implementation gate.
- Domain binding must preserve tenant data, users, media, pages, forms, themes, and imports.

## Ice Static Site Assumptions

Reviewed:

- `apps/ice-rink-web/src/config/sites.ts`
- `apps/ice-rink-web/src/lib/resolve-site.ts`
- `apps/ice-rink-web/src/lib/metadata.ts`
- `apps/ice-rink-web/src/lib/render-mode.ts`
- static publish scripts.

Findings:

- Ice/roller static site domains are currently configured per source site definition and static build environment.
- Canonical URLs and static contact endpoints are site-specific.
- Ice static contact remains a separate managed API path and is not part of Airstrip domain binding.

Decision:

- Do not reuse the Ice static site implementation as the App Service custom-domain workflow.
- Keep static-contact and email-provider workflows separate.

## External SDI-AI Compatibility

Reviewed:

- V2.8.53R external architecture and model parity reports.
- V2.8.53S external contract preservation result.

Findings:

- The external Pumpkin CMS reference must not be changed, swapped, or treated as disposable.
- Existing contract preservation strategy is additive and backward-compatible.

Decision:

- The DomainBinding manager must be optional/additive and should not require external payloads to provide new fields.

