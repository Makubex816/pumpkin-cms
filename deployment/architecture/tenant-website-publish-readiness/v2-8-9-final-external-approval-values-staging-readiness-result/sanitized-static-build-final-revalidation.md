# Sanitized Static Build Final Revalidation

Status: passed.

| Field | Value |
| --- | --- |
| Command | `npm run build:static:ice:sanitized` |
| Run ID | `sanitized_20260612173425` |
| Output | `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612173425/repo/apps/ice-rink-web/out` |
| Protected config copied | `false` |
| Protected config contents read | `false` |
| Child environment allowlist only | `true` |
| Static validate | `passed` |
| Next build | `passed` |
| Static generate | `passed` |

The build used the safe candidate endpoint as a non-secret local validation value only. It did not read `.env.local` or protected configuration.

