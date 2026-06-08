# Validation Report Format

The validator can write these local files:

```text
validation-report.json
VALIDATION_REPORT.md
support-packet.json
OPERATOR_HANDOFF.md
NON_TECHNICAL_SUMMARY.md
NEXT_ACTIONS.md
PACKAGE_FILE_INVENTORY.md
```

`validation-report.json` and `VALIDATION_REPORT.md` are written when `--out` is provided unless a format option disables one of them. Support packet files are written only when `--support-packet` is provided.

## JSON Report Fields

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
- `explanation`

The `explanation` object contains:

- `title`
- `plainLanguage`
- `likelyCause`
- `howToFix`
- `whenToAskForHelp`
- `reviewOwner`

## Gate Statuses

Phase 2A-3 uses normalized statuses from the Phase 2A plan. Current implemented report statuses are:

- `passed`
- `failed`
- `skipped`
- `deferred`
- `blocked`
- `needs_user_input`

The report marks external checks as `skipped` and deployment-profile/extension validation as `deferred`.

## Markdown Report

`VALIDATION_REPORT.md` includes:

- overall status
- phase
- summary counts
- status interpretation help
- gate statuses
- errors
- warnings
- plain-language error help
- files checked
- next actions
- boundary confirmation

## Support Packet

The support packet is meant for handoff and troubleshooting. It lists file names and findings, but it does not copy raw import package file contents by default.

Support packet outputs include:

- `support-packet.json`: machine-readable packet summary
- `OPERATOR_HANDOFF.md`: operator summary, top blockers, summaries by area, stop points, and next reviewer
- `NON_TECHNICAL_SUMMARY.md`: owner-friendly summary of what passed, what needs fixing, and when to ask for help
- `NEXT_ACTIONS.md`: prioritized fixes and hard-stop reminders
- `PACKAGE_FILE_INVENTORY.md`: checked file names and generated support files
