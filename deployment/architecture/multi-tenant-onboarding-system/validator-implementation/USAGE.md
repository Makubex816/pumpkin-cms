# Usage

Install is not required. This package uses Node built-ins and local files only.

From this directory:

```powershell
npm test
npm run check
```

## Help And Version

```powershell
node src/cli.mjs --help
node src/cli.mjs --version
```

## Validate A Package

```powershell
node src/cli.mjs --package <package-folder> --out <report-folder>
```

Example:

```powershell
node src/cli.mjs --package fixtures/valid-minimal --out .tmp/valid-minimal-report
```

## Generate One Report Format

```powershell
node src/cli.mjs --package <package-folder> --out <report-folder> --format json
node src/cli.mjs --package <package-folder> --out <report-folder> --format markdown
```

The older `--json` and `--markdown` flags remain supported.

## Generate A Support Packet

```powershell
node src/cli.mjs --package <package-folder> --out <report-folder> --support-packet
```

Support packet files:

- `support-packet.json`
- `OPERATOR_HANDOFF.md`
- `NON_TECHNICAL_SUMMARY.md`
- `NEXT_ACTIONS.md`
- `PACKAGE_FILE_INVENTORY.md`

The support packet summarizes file names and findings. It does not copy raw import source files by default.

## Explain An Error

```powershell
node src/cli.mjs --explain-error JSON_PARSE_ERROR
node src/cli.mjs --explain-code ROUTE_PAGE_MISSING
node src/cli.mjs --list-errors
```

Each explanation includes:

- plain English meaning
- likely cause
- how to fix
- when to ask for help
- review owner

## Options

- `--package <path>`: required local import package folder for validation
- `--out <path>`: local report output folder
- `--json`: write only `validation-report.json`
- `--markdown`: write only `VALIDATION_REPORT.md`
- `--format <all|json|markdown>`: choose report format; default is all
- `--strict`: treat warnings as failing for the overall status
- `--fail-on-warning`: alias for `--strict`
- `--support-packet`: add operator support packet files under `--out`
- `--explain-error <ERROR_CODE>`: print a non-technical explanation
- `--explain-code <ERROR_CODE>`: alias for `--explain-error`
- `--no-external-checks`: accepted for compatibility; external checks are never implemented in Phase 2A-3

## Exit Codes

- `0`: validation passed, or help/explanation completed
- `1`: validation found blocking issues
- `2`: validator runtime or usage error

## Status Interpretation

- `passed`: offline validator found no blocker for the gate
- `failed`: fix the named issue before import or launch review continues
- `skipped`: intentionally out of scope for this offline phase
- `deferred`: later offline work must add this validation

No CMS, Azure, Cloudflare, DNS, email, Search Console, indexing, external HTTP check, protected config read, or Roller work is performed.
