# Tenant Onboarding Package V1

This folder defines the V1 package contract for future Pumpkin tenant onboarding.

The package standard separates public, committable tenant data from the secure handoff that must stay outside the repo. A package can be validated locally before any live tenant creation, media upload, deploy, DNS, indexing, appsetting, or secret action is approved.

## Folders

- `schemas/` - JSON schemas for each package module.
- `tools/` - local validation tooling.
- `examples/blank-tenant-template/` - full non-secret package template for a new tenant.
- `examples/ice-rink-rentals/` - non-secret retrofit summary generated from live/proven Ice state.

## Validation

Run:

```powershell
node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/validate-tenant-package.mjs deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/blank-tenant-template
node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/validate-tenant-package.mjs deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/ice-rink-rentals
```

The validator writes machine-readable summaries under `.tmp/tenant-onboarding/`.

## Boundary

Public packages must not include passwords, API keys, bearer tokens, cookies, deployment tokens, connection strings, SAS tokens, or provider secrets. Those values belong only in an approved secure handoff outside the repo.
