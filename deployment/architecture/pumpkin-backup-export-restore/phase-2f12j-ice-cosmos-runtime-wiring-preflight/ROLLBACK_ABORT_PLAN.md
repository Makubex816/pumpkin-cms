# Rollback and Abort Plan

## Abort Rules

Abort runtime wiring implementation planning if:

- The provider metadata endpoint cannot be protected by existing auth.
- The metadata contract would expose secret material.
- Protected config reads are required.
- Cosmos resource identifiers do not match the Phase 2F-12H readback.
- Partition key path differs from `/tenantKey`.
- Backup policy evidence cannot be represented non-secretly.
- The implementation would switch runtime behavior implicitly.
- The implementation requires CMS writes, Azure mutation, data migration, or deployment.

## Rollback Rules

Because Phase 2F-12J performs no implementation, rollback is documentation-only. If a future implementation phase changes runtime code, rollback must be documented in that phase and must include:

- Files changed
- Profile defaults restored
- Disabled-provider guard restored
- Endpoint behavior restored
- Tests proving Cosmos is not selected as active runtime storage

## No Deletion Rule

No Cosmos resource deletion, data deletion, or CMS rollback action is approved by this package.

## Human Approval Rule

Any step that changes runtime behavior, source-of-truth data, Azure resources, or production traffic requires a fresh explicit owner approval.

