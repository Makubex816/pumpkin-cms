# Backup Validator Plan

## Required Checks

The backup validator should check:

- `manifest.json` exists and parses.
- Manifest matches `backup-manifest.schema.json`.
- Required standard bundle files exist.
- File list matches manifest.
- Checksums match.
- `BACKUP_SUMMARY.md` exists.
- `RESTORE_INSTRUCTIONS.md` exists.
- `config-inventory` contains redacted values only.
- Standard backup has `escrow/ESCROW_NOT_INCLUDED.md`.
- Standard backup has no `encrypted-secrets.*`.
- No protected config paths are included.
- No value-level secret patterns appear in standard backup files.
- Escrow mode payloads are encrypted and never plaintext when that mode is later implemented.

## Validator Output

Write:

- `VALIDATION_RESULT.md`
- `validation-result.json`
- non-technical summary;
- operator next actions.

## Failure Handling

Secret scan hits, protected path hits, missing checksums, and invalid manifest schema should fail closed and mark the artifact `blocked` or `quarantined`.

## Test Style

Use Node built-in tests, mirroring the existing offline validator and import-package-builder packages.
