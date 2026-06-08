# Protected Secret Risk Review

## Protected Config Paths Observed By Path Only

| Path | Git Status | Handling |
| --- | --- | --- |
| `apps/ice-rink-web/.env.local` | ignored | protected; not read or modified |
| `apps/pumpkin-api/appsettings.Development.json` | ignored | protected; not read or modified |

No protected config contents were read.

## Targeted Path/Name Scan

The checkpoint performed path-only scans for:

- `.env`
- `appsettings`
- `local.settings`
- `jwt`
- `token`
- `secret`
- `api_key`
- `api-key`
- `auth`
- `credential`
- `.tmp`
- `content-review`
- `.zip`
- `extracted`
- image file extensions
- `out`
- `node_modules`
- `.next`

## Risk Classification

| Risk Class | Paths | Handling |
| --- | --- | --- |
| Protected config | `.env.local`, `appsettings.Development.json` | do not read, stage, or modify |
| Raw input with possible private content | `content-review/**` | do not stage or delete |
| Generated output with possible embedded data | `.tmp/`, `.static-*`, `.next/`, `out/` | do not stage |
| Dependency/build output | `node_modules/`, `bin/`, `obj/`, `dist/` | do not stage |
| Potential auth-related names | `validate-static-output.mjs` path scan hit only `deployment/static-azure/validate-static-output.mjs` due naming context, not a secret file by path | leave for separate static/Azure code review |

## Staging Risk

No secret/protected config file was staged in this checkpoint. No `git add -A` was run.
