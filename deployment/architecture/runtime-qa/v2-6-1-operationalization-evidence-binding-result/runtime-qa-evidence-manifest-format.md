# Runtime QA Evidence Manifest Format

The evidence manifest includes the required fields from the phase prompt:

- `runId`
- `startedAt`
- `completedAt`
- `environmentMode`
- `providerProfileId`
- `layerRefs`
- `checkedRoutes`
- `checkedApis`
- `checkResults`
- `blockedReasons`
- `warnings`
- `artifactPaths`
- `sourceEvidenceRefs`
- `securityBoundarySummary`

Validation also enforces:

- all artifact paths remain under ignored `.tmp`,
- no secret-like values are present,
- all required checks are represented,
- `production-runtime` remains blocked,
- `live-write-approved` remains scoped-only or blocked,
- security boundary booleans remain closed.
