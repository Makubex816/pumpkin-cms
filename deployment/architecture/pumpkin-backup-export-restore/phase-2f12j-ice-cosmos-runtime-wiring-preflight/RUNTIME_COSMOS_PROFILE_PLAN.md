# Runtime Cosmos Profile Plan

## Purpose

The `runtime-cosmos-future` profile prepares disabled runtime wiring for Ice's future Cosmos provider. It is a code and configuration foundation only.

## Required Behavior

- Identify Ice's Cosmos provider using non-secret profile metadata.
- Keep the profile disabled for production data reads and writes until separately approved.
- Prefer managed identity and RBAC over secret-bearing connection material.
- Keep data seed and migration code behind separate explicit approvals.
- Keep live-page publication hard-stopped.

## Future Implementation Shape

The implementation should add:

- Runtime provider profile options
- Provider resolver integration
- Disabled Cosmos provider adapter wiring
- Profile selection tests
- Redaction tests
- Guard tests proving runtime switch remains false
- Diagnostic metadata for operator readback

## Runtime Source Rule

Until the production switch is separately approved, the current CMS runtime source remains the source of truth. Cosmos remains a provisioned future target.

## Ice Runtime Status After This Preflight

Expected status:

- `runtimeStatus`: `runtime-wiring-preflight-complete`
- `runtimeSwitchAllowed`: `false`
- `dataSeedAllowed`: `false`
- `liveExportAllowed`: `false`

