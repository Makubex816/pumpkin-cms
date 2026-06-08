# Validator Result

## Status

Status: `not_run_blocked`

The offline import package validator was not run against a real candidate package.

## Reason

No generated local candidate package exists.

## Expected Future Result

After a valid local package is generated, the expected validator result is:

- `0` errors
- `0` warnings, unless explicitly documented as accepted dry-run warnings
- no secret findings
- no protected path findings
- no external mutation findings
- Search Console and indexing blocked
- Roller paused unless explicitly selected

## Future Report Files

The future validator/support run should create:

- `validation-report.json`
- `VALIDATION_REPORT.md`

## Boundary Confirmation

No validator command was run against a generated real candidate package.
