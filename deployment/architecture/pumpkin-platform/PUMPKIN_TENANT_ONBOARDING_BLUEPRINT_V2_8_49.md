# Pumpkin Tenant Onboarding Blueprint V2.8.49

## Purpose

This blueprint defines the production tenant onboarding path after the Ice Rink Rentals live platform proof. It is intended for future tenants, including Roller, and must be followed with explicit approval gates for write operations.

## SuperAdmin Responsibilities

- Create and review tenant records only under approved write scope.
- Assign TenantAdmin users to the correct tenant.
- Verify tenant-scoped Theme, Page, MediaAsset, FormDefinition, ImportRun, PublishRun, and monitoring state.
- Never use SuperAdmin visibility as permission to mutate unrelated tenants.

## Tenant Record Requirements

- Stable `tenantId`.
- Display name and status.
- Public site host metadata.
- API key metadata managed by approved key-handoff flow.
- Tenant-scoped containers or partition keys validated before live writes.

## TenantAdmin/User Requirements

- At least one TenantAdmin per tenant before handoff.
- Users must be scoped to the tenant they operate.
- SuperAdmin may perform onboarding proof, but steady-state content work should use tenant-appropriate roles.

## Pages Baseline Requirements

- Required public routes must exist before publishing.
- For Ice-style tenants, minimum public route proof is `/`, `/contact`, and `/service-areas`.
- Page writes require scoped content approval.
- Page JSON must not contain provider secrets.

## MediaAsset/Azure Blob Requirements

- MediaAsset CRUD must be tenant-scoped.
- Blob storage protection must remain enabled.
- Media cleanup must be proven for synthetic assets before broad media migration.
- Storage keys, listKeys, SAS, and connection string generation require separate approval and were not used in V2.8.49.

## Theme Requirements

- Admin UI Theme CRUD must work for the tenant before launch.
- Tenant navigation must include approved public routes.
- Synthetic Theme proof must be cleaned up.
- Active Theme changes require explicit launch approval.

## FormDefinition/Form Builder Requirements

- Admin UI Form Builder must support standalone FormDefinition CRUD.
- Public FormDefinition read must work through tenant API key authentication.
- `default-quote-request` must not be used for synthetic proof unless explicitly approved.
- Synthetic FormDefinition records must be cleaned up.

## Contact/FormEntry Requirements

- Contact gate remains separate from FormDefinition CRUD.
- Contact POST requires explicit approval.
- FormEntry cleanup strategy must be known before optional non-contact submit proof.

## Import/Export Requirements

- ImportRun and export workflows must preserve tenant scope.
- Import collision handling must be proven before non-Ice tenant import.
- Operator evidence should identify tenant and package source without secrets.

## Publish/Static Deploy Requirements

- PublishRun must prove static output integration before production cutover.
- Static deploy should not mutate DNS or indexing gates.
- Static contact health must remain HTTP 200 after deploys.

## Monitoring/Runbook Requirements

- Runtime health checks must include public site, Pumpkin API, Admin UI, and static contact health.
- Alerts, diagnostics, storage protection, and backup posture must be preserved.
- Runbooks must include rollback boundaries and owner approval points.

## Per-Tenant Keys And Secret Handoff Rules

- Secret values must be supplied through approved ignored secure files only.
- Secret values must not be printed, written to reports, committed, or staged.
- Tenant API keys and Admin passwords are used in memory only.

## Cross-Tenant Isolation Proof Gates

- All synthetic writes must state tenant ID.
- Final cleanup checks must prove synthetic records are absent.
- Other-tenant mutation is a hard stop.

## Roller Tenant Next Readiness Gates

- Approve Roller tenant write scope separately.
- Confirm tenant record schema and required modules.
- Prove Admin UI tenant selection cannot accidentally mutate Ice.
- Run Roller-specific Theme/FormDefinition baseline proof before content or DNS work.
