# Pumpkin Multi-Tenant Platform Contract

Date: 2026-06-29

Status: active platform contract for future Pumpkin build phases.

## Contract

Pumpkin is a shared-platform multi-tenant system. Shared API, shared database account, shared operational docs, and shared deployment tooling may serve multiple tenants, but tenant-owned records, public tenant keys, Admin identities, page/content records, media metadata, import history, publish history, and static site bindings must remain logically isolated by tenant.

## Non-Negotiable Rules

- Every tenant-owned record includes `tenantId` unless source proves the record is global or system-scoped.
- Every tenant-owned Cosmos container uses a source-confirmed partition key. The active platform default is `/tenantId`.
- Every tenant-owned query filters by `tenantId` unless source proves explicit SuperAdmin or system scope.
- Public tenant APIs require tenant-specific API key authorization and route tenant identity.
- Admin JWTs must carry user, role, and tenant context.
- Admin and Editor users may access only their own tenant unless source explicitly gates the action to SuperAdmin.
- Cross-tenant reads and writes must be explicit, logged, and SuperAdmin or system-scoped.
- Static public apps must bind to tenant-specific API/config values and must not share public tenant keys.
- Media must be tenant-separated by account, container, prefix, or source mapping.
- Future phases must include a multi-tenancy impact check before closeout.

## Shared Resource Model

- Pumpkin API: shared platform service.
- Cosmos account/database: shared platform resource with tenant-partitioned containers.
- Static Web Apps: tenant-specific public runtimes where appropriate.
- Blob media: tenant-isolated by storage account/container/prefix mapping.
- Admin UI: shared operator/admin surface, but all data calls must carry selected tenant scope and enforce API RBAC.

## Active Scope Baseline

V2.8.36 confirms the active source contract for `Tenant`, `User`, `Page`, `MediaAsset`, `PublishRun`, `ImportRun`, and no-regression `FormEntry`. Themes and Form Definitions are intentionally excluded until a future approved phase.

## Future Gate

No future Pumpkin phase should close if it changes tenant-owned behavior without proving:

- tenant identity path;
- source-level tenant query or partition behavior;
- RBAC boundary;
- public key or JWT boundary;
- static tenant binding impact;
- media tenant isolation impact;
- backup/monitoring implication.
