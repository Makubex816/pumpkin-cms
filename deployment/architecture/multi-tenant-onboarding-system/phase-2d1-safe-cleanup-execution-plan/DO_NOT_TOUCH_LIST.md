# Do Not Touch List

## Raw Inputs

- `content-review/ice-final-contact-input/`
- `content-review/ice-service-areas-input/`

These are raw content-ingestion inputs. They must not be staged, deleted, moved, renamed, or normalized in Phase 2D-1.

## Ignored Generated Output

- `.static-release-dry-runs/`
- `apps/admin/.next/`
- `apps/admin/node_modules/`
- `apps/ice-rink-web/.next/`
- `apps/ice-rink-web/.static-artifacts/`
- `apps/ice-rink-web/.static-content-snapshots/`
- `apps/ice-rink-web/out/`
- `apps/ice-rink-web/node_modules/`
- `deployment/architecture/multi-tenant-onboarding-system/import-package-builder/.tmp/`
- `deployment/architecture/multi-tenant-onboarding-system/validator-implementation/.tmp/`
- `packages/*/dist/`
- `packages/*/node_modules/`
- `tools/*/bin/`
- `tools/*/obj/`
- `apps/*/bin/`
- `apps/*/obj/`

Generated output can be cleaned only after a later explicit deletion approval naming the exact paths.

## Protected Config And Secret-Risk Paths

- `apps/ice-rink-web/.env.local`
- `apps/pumpkin-api/appsettings.Development.json`
- any `local.settings.json`
- credential files
- cache files that can contain credentials
- files containing API keys, JWTs, auth headers, cookies, tokens, connection strings, or storage keys

Phase 2D-1 observed protected config paths by status only. It did not read or modify them.

## Out Of Scope For Phase 2D-1

- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `apps/ice-rink-web/src/app/page.tsx`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `deployment/static-azure/`
- `deployment/azure/ice-static-form-real-email-delivery-preflight/`

These may be legitimate work, but they are not part of this docs cleanup/staging plan.

## External Systems

Do not modify CMS, Azure, Cloudflare, DNS, Function App settings, deployment targets, email/Microsoft 365, Search Console, indexing, or live pages under this phase.
