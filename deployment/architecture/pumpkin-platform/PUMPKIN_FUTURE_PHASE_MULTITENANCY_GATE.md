# Pumpkin Future Phase Multi-Tenancy Gate

Date: 2026-06-29

Every future Pumpkin phase must answer this gate before closeout.

## Required Checks

- Does the phase read, write, create, delete, publish, deploy, import, or preview tenant-owned data?
- Which tenant ID is used, and where does it come from?
- Does every tenant-owned record include `tenantId`?
- Does every data query filter by `tenantId`, or is it explicitly SuperAdmin/system-scoped?
- Does every Cosmos container touched by the phase have a source-confirmed partition key?
- Does Admin access enforce JWT tenant and role context?
- Does public access enforce tenant-specific API key context?
- Does the Admin UI use the selected/current tenant and prevent accidental cross-tenant actions?
- Does static runtime configuration bind to the correct tenant and site?
- Does media storage remain tenant-separated by account, container, prefix, or mapping?
- Does the phase change backup, monitoring, or cleanup risk for shared resources?
- Are Themes and Form Definitions still excluded unless explicitly approved?

## Hard Stops

- Stop if tenant scope is unknown.
- Stop if the partition key is unknown.
- Stop if an Admin/Editor path can access another tenant without SuperAdmin authorization.
- Stop if a public tenant key can authorize another tenant.
- Stop if static runtime config can submit or read under the wrong tenant.
- Stop if a write path would create tenant-owned data without `tenantId`.

## Closeout Requirement

Each phase report must include a short multi-tenancy impact section with pass/fail classification, evidence references, and the next remediation if any check is unresolved.
