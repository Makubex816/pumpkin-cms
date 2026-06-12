# Pumpkin Tenant Website Publish Readiness V2.8.5 Sanitized No-Dotenv Static Build Approval Packet Report

Status: complete local sanitized build path and approval packet closure; staging execution remains blocked.

Result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-5-sanitized-no-dotenv-static-build-approval-packet-result/
```

Tracker recommendation:

- Current reference: `V2.8.5`
- Current lane: `V2.8 Tenant Website / Publish Readiness`
- Provisional V2 overall completion: `90%`
- V2.8 completion: `91%`
- Layer refs: `L01`, `L02`, `L03`, `L04`, `L06`, `L07`, `L08`, `L09`, `L10`, `L11`, `L12`, `L15`
- Next recommended reference: `V2.8.6 Contact Form Owner Verification and Exact Staging Target Closure`

## What Closed

The missing repo-supported sanitized no-dotenv static build path is closed for Ice.

Added:

- `apps/ice-rink-web/scripts/sanitized-static-build.mjs`
- `npm run build:static:ice:sanitized`
- `apps/ice-rink-web/.gitignore` ignore rule for local `.tmp` build evidence

The wrapper creates an allowlisted temporary workspace under ignored `.tmp`, excludes dotenv/protected config files by path/name, uses a minimal child-process environment, runs static content validation, runs the Next static build, and generates static publish artifacts from the sanitized workspace.

Latest proof:

- Run ID: `sanitized_20260612144750`
- Result file: `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612144750/SANITIZED_STATIC_BUILD_RESULT.json`
- Protected config copied: `false`
- Protected config contents read: `false`
- Child environment allowlist only: `true`
- Static validate / Next build / static generate: `passed`
- Output protected-config reference detection: `false`

## Current No-Go Status

Staging execution is still blocked by human and target approval gates:

- contact-form owner verification is missing
- final media/content approval is missing
- exact staging deployment target is not approved
- exact DNS target is not approved
- Search Console/indexing remains closed
- live-page publication remains closed

The existing static output and staging package validators now run against sanitized output, but both correctly fail on the missing static form endpoint/backend verification because no approved static form endpoint values were present in this terminal session.

## Validation

- `npm run build:static:ice:sanitized`: passed.
- `npm run type-check`: passed.
- `npm run validate:static:ice`: passed with 34 warnings.
- `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612144750/repo/apps/ice-rink-web/out`: failed only on missing static form endpoint/backend verification.
- `node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612144750/repo/apps/ice-rink-web/out`: failed only on missing static form endpoint/backend verification.
- `git check-ignore -v` confirmed the sanitized `.tmp` evidence path is ignored.

## Closed Gates

Still closed:

- deployment
- DNS changes
- Search Console/indexing
- live publication
- CMS writes
- provider writes
- production migration
- Azure mutation
- RBAC assignment
- external crawling or live outbound URL checks
- keys/listKeys, connection strings, and SAS

No protected config file was opened, printed, copied, moved, renamed, parsed, sourced, or modified.

Exact next approval wording is in:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-5-sanitized-no-dotenv-static-build-approval-packet-result/next-phase-prompt.md
```

Exact-path commit instructions:

```text
git add apps/ice-rink-web/.gitignore
git add apps/ice-rink-web/package.json
git add apps/ice-rink-web/README.md
git add apps/ice-rink-web/scripts/sanitized-static-build.mjs
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_4_STAGING_PUBLISH_WORKSHEET_NO_GO_REPORT.md
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_5_SANITIZED_NO_DOTENV_STATIC_BUILD_APPROVAL_PACKET_REPORT.md
git add PUMPKIN_PLATFORM_SOURCE_OF_TRUTH.md
git add PUMPKIN_PLATFORM_TRACKER.md
git add PUMPKIN_PLATFORM_ACTIVE_BLOCKERS_AND_GATES.md
git add PUMPKIN_PLATFORM_CANONICAL_DOC_INDEX.md
git add deployment/architecture/tenant-website-publish-readiness/v2-8-4-staging-publish-worksheet-no-go-result/
git add deployment/architecture/tenant-website-publish-readiness/v2-8-5-sanitized-no-dotenv-static-build-approval-packet-result/
git commit -m "Add Ice sanitized static build approval packet"
```
