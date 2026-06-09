# CLI Command Plan

## Planned Command

```powershell
node src/builder-cli.mjs --answers answers.example.json --out .tmp/generated-package --validate --support-packet
```

This command is not implemented in this planning phase.

## Planned Options

| Option | Required | Purpose |
| --- | --- | --- |
| `--answers <path>` | yes | Path to local answers JSON file. |
| `--out <path>` | yes | Local generated package output folder. |
| `--validate` | no | Run existing offline validator after generation. |
| `--support-packet` | no | Export support packet after validation; implies `--validate`. |
| `--overwrite` | no | Allow overwrite of known generated files inside safe output folder. |
| `--dry-run` | no | Show generation plan without writing files. |
| `--json` | no | Request JSON report output from validator. |
| `--markdown` | no | Request Markdown report output from validator. |
| `--help` | no | Show usage, examples, hard stops, and exit codes. |
| `--version` | no | Print builder prototype version. |

## Exit Codes

- `0`: answers loaded, package generated, and validator passed if requested
- `1`: builder validation failed or generated package failed validator
- `2`: usage error, parse error, unsafe path, runtime error, or validator runtime error

## Terminal Summary

The command should print:

- answers file path
- output folder path
- generated file count
- validation status
- support packet status
- top blockers if any
- local-only boundary confirmation

## Hard Stop Help Text

Help output must say:

```text
This builder is local/offline only. It does not create a tenant, import content, write CMS data, modify Azure, modify Cloudflare, change DNS, deploy, send email, use Search Console, request indexing, perform external checks, read protected config, or touch Roller.
```
