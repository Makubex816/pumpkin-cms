# Sanitized Static Build Revalidation

Status: passed.

| Field | Value |
| --- | --- |
| Command | `npm run build:static:ice:sanitized` |
| Run ID | `sanitized_20260612180602` |
| Output | `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612180602/repo/apps/ice-rink-web/out` |
| Protected config copied | `false` |
| Protected config contents read | `false` |
| Child environment allowlist only | `true` |
| Static validate | `passed` |
| Next build | `passed` |
| Static generate | `passed` |

The build used only non-secret public endpoint and approval flags in the process environment. Backend verification and live-check flags were intentionally not set.

