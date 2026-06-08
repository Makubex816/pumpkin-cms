# CLI Entrypoint Plan

This is a future command plan only. Do not implement commands in this planning run.

## Future Commands

```text
pumpkin tenant validate-intake
pumpkin tenant validate-import-package
pumpkin tenant validate-all
pumpkin tenant explain-error
pumpkin tenant export-support-packet
```

## Future Flags

| Flag | Purpose |
| --- | --- |
| `--tenant-package <path>` | Path to intake/import package folder. |
| `--profile <profileId>` | Deployment profile override or assertion. |
| `--strict` | Treat warnings as failures. |
| `--json` | Write or print machine-readable JSON report path/result. |
| `--markdown` | Write Markdown report. |
| `--no-external-checks` | Required default for Phase 2A; forbids network/external checks. |
| `--output-dir <path>` | Optional report output directory inside package or safe workspace path. |

## Entrypoint Behavior

Default behavior:

- offline only
- no external checks
- no CMS writes
- no deployment
- no email
- no Search Console/indexing
- no secret printing

## Explain Error

`pumpkin tenant explain-error` should eventually accept a finding code and print:

- plain-language explanation
- likely cause
- safe fix
- whether user or operator owns the fix

