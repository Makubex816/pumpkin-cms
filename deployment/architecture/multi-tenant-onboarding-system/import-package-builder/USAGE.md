# Usage

Run commands from this folder:

```powershell
cd deployment/architecture/multi-tenant-onboarding-system/import-package-builder
```

## Main Command

```powershell
node src/builder-cli.mjs --answers fixtures/example-event-rentals.answers.json --out .tmp/generated-example --validate --support-packet
```

## Options

| Option | Required | Purpose |
| --- | --- | --- |
| `--answers <path>` | yes | Local non-secret answers JSON file. |
| `--out <path>` | yes | Local generated package output folder. |
| `--validate` | no | Run the existing offline validator after generation. |
| `--support-packet` | no | Write validator support packet files; implies `--validate`. |
| `--overwrite` | no | Replace known generated files in an existing output folder. |
| `--dry-run` | no | Print preview/diff summary without writing package files. |
| `--json` | no | Request JSON validator report only. |
| `--markdown` | no | Request Markdown validator report only. |
| `--help` | no | Show help, examples, hard stops, and exit codes. |

## NPM Scripts

```powershell
npm test
npm run check
npm run generate:example
npm run validate:generated-example
```

## Preview/Diff Summary

`--dry-run` does not create the output folder and does not run validation. It reports:

- files that would be created
- files that would be overwritten
- unchanged files
- generated pages and routes
- media references
- form references
- the validator command that would run if generation continued

Full line-by-line file diffs are not implemented in Phase 2B-2; the preview is a safe summary.

## Exit Codes

- `0`: builder completed and validator passed if requested
- `1`: answers failed validation, generated package failed validator, or support packet redaction failed
- `2`: usage, path, parse, or runtime error

## Safe Failure Behavior

- Parse errors stop before generation.
- Answer validation errors stop before generation.
- Secret-like answer values stop before generation.
- URL credentials, local paths, staging URLs, paused tenant references, and unrelated tenant references stop before generation.
- A non-empty output folder requires `--overwrite`.
- `--overwrite` removes only known generated files and keeps unrelated files.
- Validator failures keep generated files local and report failed status.
- Support packet redaction failures return failed builder status.
- `--dry-run` writes no package files and skips validation.
