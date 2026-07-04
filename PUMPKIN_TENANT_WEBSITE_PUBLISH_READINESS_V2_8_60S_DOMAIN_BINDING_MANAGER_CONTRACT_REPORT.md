# V2.8.60S Tenant Domain Binding Manager Contract Report

Status: completed.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: tenant_domain_binding_manager_contract_design_no_mutation.

## Carryforward

V2.8.60R left Airstrip live on the production default host:

- `https://app-airstrip-prod-centralus-001.azurewebsites.net`
- Mobile responsive repair completed.
- Durable overlay exists at `deployment/airstrip/patches/v2-8-60r-mobile-responsive/`.
- Local, isolated, and production responsive proofs passed 28/28.
- Bluehost DNS and custom-domain binding remained paused.
- No nameserver, Azure DNS, Google Workspace DNS, CDN/Front Door, indexing, contact POST, form submission, media mutation, Ice mutation, key/list operation, or SAS action occurred.

## Definition

Tenant Domain Binding Manager is a SuperAdmin-only control-plane workflow for validating, binding, promoting, replacing, and auditing public domains attached to a Pumpkin tenant while preserving tenant data, users, media, pages, forms, themes, and hosting resources.

This is not resource swapping. The default design changes domain metadata, DNS record packets, Azure hostname binding state, TLS state, canonical-domain state, runtime proof state, rollback state, and audit history.

## Source Audit Summary

- `apps/pumpkin-net-models/Models/Tenant.cs` and `packages/pumpkin-ts-models/src/models/Tenant.ts` contain tenant identity, plan/status, contact, billing, feature flags, and `settings.allowedOrigins`; they do not contain a first-class domain binding lifecycle.
- `apps/pumpkin-api/Program.cs` already has SuperAdmin-only tenant routes and role checks that the future domain manager can follow.
- `apps/pumpkin-api/Services/IDataConnection.cs` and `CosmosDataConnection.cs` expose tenant, page, publish run, import run, form, media, theme, and user methods; the future manager should add a separate tenant-partitioned DomainBinding store rather than overloading content records.
- `apps/admin/src/app/dashboard/layout.tsx`, `apps/admin/src/app/dashboard/onboarding/page.tsx`, and `apps/admin/src/app/dashboard/tenants/page.tsx` provide SuperAdmin-only navigation and page access patterns.
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/schemas/domains.schema.json` currently records package-level `primaryHost`, `hosts`, and approval flags. That schema remains intake metadata, not the runtime binding ledger.
- `apps/ice-rink-web/src/config/sites.ts` and related metadata/rendering files show Ice domain and canonical behavior are hard-coded per site build today.
- External SDI-AI compatibility remains extension-only: no external repo, database, or dependent system should be changed or swapped.

## Contract Summary

The approved design is a new `DomainBinding` sidecar model, partitioned by `/tenantId`, with explicit state transitions, DNS record packet history, Azure App Service hostname/TLS status, runtime proof evidence, canonical promotion controls, rollback state, and audit events.

The manager should support manual DNS packet mode first, then Bluehost owner-assisted mode, then Azure DNS and Front Door as later providers. Google Workspace email DNS and CDN/Front Door remain separate workflows.

## Runtime No-Regression

GET-only no-regression passed on July 4, 2026:

- Ice apex and www `/`, `/contact`, `/service-areas`: HTTP 200.
- Ice apex and www `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health` and `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.
- Airstrip production default-host `/`, `/request-booking`, `/packages`, `/airstrip-the-club`: HTTP 200.

No contact POST, form submission, content write, deployment, Azure mutation, DNS mutation, custom-domain binding, indexing action, storage key/list operation, SAS generation, or protected config read occurred.

## Files

Result package:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-60s-domain-binding-manager-contract-result/`

Durable docs:

- `deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_DOMAIN_BINDING_MANAGER_V2_8_60S.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_DOMAIN_BINDING_DATA_MODEL_V2_8_60S.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_DOMAIN_BINDING_API_UI_PLAN_V2_8_60S.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_DOMAIN_MANAGER_FIRST_USE_V2_8_60S.md`

## Next Approval

The next approval is folded into `deployment/architecture/tenant-website-publish-readiness/v2-8-60s-domain-binding-manager-contract-result/next-phase-prompt.md`.

