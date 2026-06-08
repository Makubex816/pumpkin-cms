# Validation Report Format

The skeleton writes:

```text
validation-report.json
VALIDATION_REPORT.md
```

## JSON Fields

- `schemaVersion`
- `validatorVersion`
- `phase`
- `tenantId`
- `siteKey`
- `packagePath`
- `profileId`
- `overallStatus`
- `gateStatuses`
- `findings`
- `nextActions`
- `filesChecked`
- `summary`
- `outputs`
- `boundaryConfirmation`

## Finding Shape

Each finding includes:

- `severity`
- `code`
- `file`
- `jsonPointer`
- `field`
- `route`
- `message`
- `ownerExplanation`
- `operatorDetail`
- `nextAction`
- `gateId`
- `blocksGate`

## Gate Statuses

Phase 2A-1 uses normalized statuses from the Phase 2A plan. Current implemented report statuses are:

- `passed`
- `failed`
- `skipped`
- `deferred`

The report marks external checks as `skipped` and deeper cross-file validation as `deferred`.
