# Sanitized No-Dotenv Static Build Proof

Status: closed for Ice local static build readiness.

## Implemented Path

Command:

```text
npm run build:static:ice:sanitized
```

Script:

```text
apps/ice-rink-web/scripts/sanitized-static-build.mjs
```

The wrapper builds from an allowlisted temporary repo-shaped workspace under:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/
```

The temporary workspace copies only approved source paths needed for the Ice seed-site static build, links local installed app dependencies through a junction, and runs:

- `node scripts/static-publish.mjs validate`
- `node node_modules/next/dist/bin/next build`
- `node scripts/static-publish.mjs generate`

## Protected Config Boundary

The wrapper does not open, print, copy, move, rename, parse, source, or modify `.env.local` or protected config.

Protected config is avoided by construction:

- app root is not copied wholesale
- source paths are allowlisted
- dotenv/protected config names are excluded by path/name
- generated/local folders are excluded
- the child process receives a minimal allowlisted environment
- generated evidence is written only under ignored `.tmp`

## Latest Evidence

- Run ID: `sanitized_20260612144750`
- Result JSON: `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612144750/SANITIZED_STATIC_BUILD_RESULT.json`
- Output folder: `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612144750/repo/apps/ice-rink-web/out`
- Protected config copied: `false`
- Protected config contents read: `false`
- Child environment allowlist only: `true`
- Dependency mode: `app-node-modules-junction`
- Static validate: `passed`
- Next static build: `passed`
- Static generate: `passed`
- Protected config reference in command output: `false`

## Git Ignore Proof

`git check-ignore -v` confirmed the generated result file is ignored by:

```text
apps/ice-rink-web/.gitignore:36:/.tmp/
```
