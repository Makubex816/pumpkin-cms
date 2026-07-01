# Pumpkin Onboarding UI Operations Map V2.8.54A

Date: 2026-07-01

Status: completed_read_only_no_mutation

## Operation Ownership

| Operation | Admin UI Surface | Package/CLI/Codex Surface | Manual/Secure Surface | V2.8.54A Decision |
| --- | --- | --- | --- | --- |
| Package validation | none | `tenant-onboarding-package/v1/tools/validate-tenant-package.mjs` | none | CLI/Codex-driven |
| Tenant review | `/dashboard/tenants` | package docs | secure handoff for creation values | UI-source present, creation blocked |
| Tenant creation | `/dashboard/tenants` | package/runbook | secure handoff | not approved |
| Page import | `/dashboard/pages/import-export` | package pages and validator | none | dry-run first |
| Page editing | `/dashboard/pages` | package pages | none | source present |
| Theme setup | `/dashboard/themes` | package theme | none for public fields | browser-proven |
| Form setup | `/dashboard/form-builder` | package forms | provider values separate | browser-proven |
| Lead readback | `/dashboard/forms` | none | auth session | route-proven |
| Media upload | `/dashboard/media` | media manifest | ignored media source files | upload not approved |
| Publish review | `/dashboard/publishing` | static dry-run artifacts | deployment approvals | review only |
| Deploy | no Admin UI deploy button approved | static publish runbooks/scripts | deployment credentials outside repo | not approved |
| DNS | no Admin UI mutation | runbook | owner/operator DNS access | not approved |
| Indexing | no Admin UI mutation | runbook | owner/operator search access | not approved |
| External compatibility | docs/API aliases | V2.8.53S docs | external repo immutable | preserve hard baseline |
| Backup/restore | no dedicated Admin route | backup docs/scripts | operator approvals | separate phase |

## Practical Resume Path

When the partner package arrives, run a read-only V2.8.55 package preflight. Do not create a tenant in the same step unless the approval explicitly grants live mutation and names the package, secure handoff, target tenant ID, rollback boundary, and proof gates.

## Guardrails

- Never use blanket all-file staging for onboarding closeouts.
- Do not stage `.tmp`.
- Do not place credential values in repo docs or package files.
- Do not mutate the external SDI-AI reference repo.
- Do not rename live containers without a separately approved migration.
