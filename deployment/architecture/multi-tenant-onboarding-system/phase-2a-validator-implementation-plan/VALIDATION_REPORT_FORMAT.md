# Validation Report Format

Phase 2A should produce both:

```text
validation-report.json
VALIDATION_REPORT.md
```

## Machine-Readable JSON

Required top-level fields:

- `schemaVersion`
- `tenantId`
- `siteKey`
- `packagePath`
- `profileId`
- `overallStatus`
- `gateStatuses`
- `findings`
- `nextActions`
- `outputs`
- `boundaryConfirmation`

## Gate Status Records

Each gate record should include:

- `gateId`
- `status`
- `summary`
- `blockingFindingCodes`
- `ownerActionRequired`

## Findings

Each finding should include:

- `severity`: `info`, `warning`, `error`, or `critical`
- `code`: stable uppercase code
- `file`
- `jsonPointer`
- `route`
- `field`
- `message`
- `ownerExplanation`
- `operatorDetail`
- `nextAction`
- `blocksGate`

## Markdown Report

The Markdown report should include:

- summary
- status table
- errors
- warnings
- skipped/deferred gates
- owner-facing explanations
- file/field pointers
- next actions
- boundary confirmation
- support packet location if generated

## Redaction

Reports must never print secret values. For secret-looking findings, report:

- detector code
- file path
- JSON pointer if known
- redacted value shape
- remediation guidance

## Pass/Fail Policy

Future CLI:

- pass if no blocking errors are found
- fail if any required gate is `failed`, `blocked`, or `rollback_required`
- support `--strict` to treat warnings as failures for release gates

