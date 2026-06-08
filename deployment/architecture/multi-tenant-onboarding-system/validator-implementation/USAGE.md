# Usage

Install is not required. This package uses Node built-ins and local files only.

From this directory:

```powershell
npm test
npm run check
```

Validate the passing fake fixture:

```powershell
npm run validate:example
```

Validate a package directly:

```powershell
node src/cli.mjs --package <package-folder> --out <report-folder>
```

Options:

- `--package <path>`: required local import package folder
- `--out <path>`: optional local report output folder
- `--json`: write only `validation-report.json`
- `--markdown`: write only `VALIDATION_REPORT.md`
- `--strict`: treat warnings as failing for the overall status
- `--no-external-checks`: accepted for compatibility; external checks are never implemented in Phase 2A-1

Exit codes:

- `0`: validation passed
- `1`: validation failed
- `2`: validator runtime or usage error
