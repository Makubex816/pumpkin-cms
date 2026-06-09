# Runtime Profile Resource Mapping

Runtime profiles should reference resources without embedding credentials.

## Profile Mapping Fields

- `runtimeProfileId`
- `profileName`
- `tenantKeys`
- `environment`
- `resourceIds`
- `credentialRefs`
- `status`
- `liveDatabaseExportAllowed`
- `runtimeSwitchAllowed`
- `productionWritesAllowed`
- `blockedReasonCodes`

## Current Profiles

From Phase 2F-12K:

- `local-dev`
- `offline-bundle`
- `fake-provider`
- `local-with-live-readonly`
- `live-readonly`
- `runtime-cosmos-future`
- `production-write-approved`

## Ice Current Profile

Ice maps to `runtime-cosmos-future`.

Required registry state:

- Live database export: false
- Runtime switch: false
- Production writes: false
- Next action: data seed/migration preflight

