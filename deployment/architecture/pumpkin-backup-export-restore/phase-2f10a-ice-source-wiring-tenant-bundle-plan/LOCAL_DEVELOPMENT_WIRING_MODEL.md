# Local Development Wiring Model

Local development must remain separate from live Azure backup wiring.

## Local Sources

| Layer | Local Source | Role |
| --- | --- | --- |
| App runtime | `apps/ice-rink-web` Next.js app | Local render/static export |
| Static source fallback | `tools/ice-rink-local-seed/seed-sites/` per bridge docs | Developer/bootstrap content only |
| CMS snapshots | `apps/ice-rink-web/.static-content-snapshots/{siteKey}/` | Generated publish snapshots, ignored |
| Static artifacts | `apps/ice-rink-web/.static-artifacts/{siteKey}/out/` | Generated static output, ignored |
| Dry-run packages | `.static-release-dry-runs/` | Local deployment rehearsal output |
| Backup output | `deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/` | Local ignored backup/restore output |
| Local media uploads | API `MediaStorageService` local-dev provider | Local development only |

## Local Rules

- Local dev may use seed-site content for development.
- Once CMS publishing is active, seed-sites are not live source of truth.
- Local profiles must not read protected config by default.
- Env readiness checks print only PRESENT/MISSING.
- Generated snapshots, static artifacts, dry-runs, backups, and restore outputs remain ignored.
- Local media provider output is not production media proof.

## Local Profiles

| Profile | Purpose | External Access |
| --- | --- | --- |
| `local-dev` | offline/local development with seed content | none |
| `local-with-live-readonly` | local tools calling approved read-only CMS endpoints | GET/HEAD only after env gate |
| `azure-readonly-backup` | list Azure resource names/metadata for backup wiring | Azure read-only discovery only |
| `azure-export-approved` | future DB/blob export/copy execution | separate approval required |
| `production-write-approved` | future restore/import/write path | not part of Backup Center baseline work |

