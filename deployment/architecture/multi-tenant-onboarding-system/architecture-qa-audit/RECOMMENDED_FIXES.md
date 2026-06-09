# Recommended Fixes

## Applied In This Audit

- Added `WHEN_TO_STOP_AND_ASK_FOR_HELP.md`.
- Added owner contacts expectations, schema, and example template.
- Added approvals expectations, schema, and example template.
- Added validation report expectations, schema, and JSON example template.
- Added support packet expectations, schema, and JSON example template.
- Updated import package folder structure and import order.
- Updated validation report format guidance.
- Updated wizard field definitions to map fields to JSON artifacts.
- Updated operator content import runbook with owner/approval/report checks.
- Updated profile selection guide with a decision checklist.
- Updated extension manifest spec with required review questions.
- Added fake tenant audit simulation.

## Recommended Before Phase 2 Coding

1. Normalize gate status vocabulary across all docs and schemas.
2. Define cross-file validator interfaces and fixtures.
3. Define URL safety allowlist/denylist rules.
4. Decide whether `tenant.json.owners` remains or is replaced by `owner-contacts.json`.
5. Add validator fixture catalog with positive and negative examples.
6. Add profile-specific smoke-test matrix.
7. Add deployment profile env var classification model.
8. Add extension permission enum and migration schema.
9. Add secret exposure incident runbook.
10. Add acceptance criteria per CLI/Admin UI screen before UI implementation.

## Recommended Next Step

Create a Phase 2 validator implementation plan only. Do not implement validators, wizard, CLI, tenant creation, deployment, or external mutations without separate approval.
