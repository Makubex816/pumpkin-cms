# Do Not Stage List

Do not stage these paths with `git add -A` or any broad staging command.

## Protected Config And Secret-Risk Paths

- `apps/ice-rink-web/.env.local`
- `apps/pumpkin-api/appsettings.Development.json`
- any `local.settings.json` if present
- any credential/cache file
- any uploaded env/key text file
- any file containing API keys, JWTs, auth headers, cookies, tokens, connection strings, or storage keys

## Raw Inputs

- `content-review/ice-final-contact-input/`
- `content-review/ice-service-areas-input/`

These contain raw zip, extracted, JSON, HTML, and image inputs. They should remain under a separate content-ingestion/review workflow.

## Ignored Generated Output

- `.static-release-dry-runs/`
- `apps/admin/.next/`
- `apps/ice-rink-web/.next/`
- `apps/ice-rink-web/.static-artifacts/`
- `apps/ice-rink-web/.static-content-snapshots/`
- `apps/ice-rink-web/out/`
- `deployment/architecture/multi-tenant-onboarding-system/import-package-builder/.tmp/`
- `deployment/architecture/multi-tenant-onboarding-system/validator-implementation/.tmp/`
- `node_modules/`
- `bin/`
- `obj/`
- `dist/`
- TypeScript build info files

## Unrelated Current-Checkpoint Paths

- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `apps/ice-rink-web/src/app/page.tsx`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `deployment/static-azure/`
- `deployment/azure/ice-static-form-real-email-delivery-preflight/`

These may be legitimate work, but they are not part of Phase 2D-0 staging.

## Accidental Artifact Pending Delete Approval

- `tatus --short`

This file should not be staged. Delete only after explicit approval.
