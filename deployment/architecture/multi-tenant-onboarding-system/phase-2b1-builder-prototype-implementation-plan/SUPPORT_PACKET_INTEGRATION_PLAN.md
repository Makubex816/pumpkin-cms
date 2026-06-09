# Support Packet Integration Plan

## Purpose

Support packet export should make failed or passed generated packages easier to hand off without exposing secrets or raw protected config.

## Future CLI Behavior

`--support-packet` should:

- require or imply `--validate`
- ask the existing validator to write support packet files
- leave files under the local output folder
- include support packet file paths in builder summary

## Expected Files

- `support-packet.json`
- `OPERATOR_HANDOFF.md`
- `NON_TECHNICAL_SUMMARY.md`
- `NEXT_ACTIONS.md`
- `PACKAGE_FILE_INVENTORY.md`

## Include

- generated package file inventory
- validation report references
- top blockers
- owner contact summary from answers
- manual approval statuses from answers
- analytics and privacy decision summaries
- local-only boundary confirmation

## Exclude

- raw protected config
- real passwords or tokens
- raw image files by default
- unrelated tenant files
- Search Console verification data
- mailbox contents or credentials

## Failure Behavior

Support packet export must be available even when validation fails. The packet must clearly say the generated package is not import-ready when validator status is failed.
