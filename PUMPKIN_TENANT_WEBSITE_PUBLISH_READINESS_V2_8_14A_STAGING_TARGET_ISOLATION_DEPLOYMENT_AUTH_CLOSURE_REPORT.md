# Pumpkin Tenant Website Publish Readiness V2.8.14A Staging Target Isolation Deployment Auth Closure Report

Status: complete; classified `blocked_auth_missing`.

Result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-14a-staging-target-isolation-deployment-auth-closure-result/
```

Tracker recommendation:

- Current reference: `V2.8.14A`
- Current lane: `V2.8 Tenant Website / Publish Readiness`
- Provisional V2 overall completion: `92%`
- V2.8 completion: `99%`
- Layer refs: `L01`, `L02`, `L03`, `L04`, `L06`, `L07`, `L08`, `L09`, `L10`, `L11`, `L12`, `L15`
- Next recommended reference: `V2.8.14B Scoped Ice Isolated Staging Deployment Execution`

## What Is Complete

- Confirmed the old target `swa-ice-static-staging` remains blocked because production custom domains are attached.
- Created and verified one isolated non-production Static Web App target: `swa-ice-static-isolated-staging`.
- Verified the isolated target has no custom domains.
- Defined the future deployment target as `kind-island-0a85a740f.7.azurestaticapps.net`.
- Defined the canonical deployment auth env var as `SWA_CLI_DEPLOYMENT_TOKEN`.
- Added a repo-local deployment readiness wrapper.
- Rebuilt and validated a fresh sanitized Ice static artifact.
- Kept deployment, DNS, indexing, and live-publication gates closed.

## What Remains Not Ready

`SWA_CLI_DEPLOYMENT_TOKEN` is absent from the current terminal session. No future deployment execution should proceed until the isolated target deployment token is present by presence-only check.

## Target Results

Blocked target:

| Field | Value |
| --- | --- |
| Name | `swa-ice-static-staging` |
| Default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| Custom domains | `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com` |
| Result | blocked |

Created isolated target:

| Field | Value |
| --- | --- |
| Name | `swa-ice-static-isolated-staging` |
| Resource group | `rg-ice-static-staging` |
| Default hostname | `kind-island-0a85a740f.7.azurestaticapps.net` |
| Location | `East US 2` |
| SKU | `Free` |
| Custom domains | none |
| Result | future scoped staging target |

## Deployment Auth And Tooling

- Required env var: `SWA_CLI_DEPLOYMENT_TOKEN`.
- Presence result: absent.
- Global `swa` CLI on PATH: absent.
- Repo-supported invocation: `npx --yes @azure/static-web-apps-cli@2.0.9`.
- SWA CLI version check: `2.0.9`.
- Added wrapper: `deployment/static-azure/scripts/ice-isolated-swa-deploy-readiness.mjs`.
- Wrapper result: target/artifact checks passed; auth missing.

No token value was read, printed, exported, listed, or written.

## Artifact Candidate

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612225811/repo/apps/ice-rink-web/out
```

- File count: `41`
- Aggregate SHA-256: `e0eb1a62a9bce21f8435d272e176ec4f8df5fe65f921367fe2ac53c951624679`
- Required routes present: `/`, `/service-areas`, `/contact`
- Required files present: `sitemap.xml`, `robots.txt`
- High-confidence secret-like matches: `0`
- Forbidden artifact path matches: `0`

## Validation

- `npm run build:static:ice:sanitized`: passed, `sanitized_20260612225811`.
- `npm run validate:static:ice`: passed with 34 existing warnings.
- `npm run type-check`: passed.
- `node scripts/static-publish.mjs generate`: passed with 34 existing warnings.
- Static output validator: passed.
- Staging package validator: passed.
- Runtime QA check: passed.
- Runtime QA evidence run/validation: passed, `runtimeqa_c17a9232c6245e9d`, 1 warning.
- Resource Registry operational bindings: passed.
- OLM provider profile check: passed; live writes disabled.
- Static form endpoint package check/tests: passed.
- Deployment readiness wrapper: blocked only by missing `SWA_CLI_DEPLOYMENT_TOKEN`.

## Security Boundary

Confirmed no static artifact deployment, production deployment, DNS change, custom domain mutation, indexing, live publication, external crawling, outbound URL check, contact form submission, contact endpoint POST, CMS write, provider write, app settings mutation, RBAC assignment, protected config read, `.env.local` read/print/copy/move/rename/parse/source/modify, deployment-token print/export/listing, Key Vault secret query, keys/listKeys, connection string generation, or SAS generation occurred.

The only Azure infrastructure mutation was the explicitly approved creation of one isolated non-production Static Web App target.

Exact next approval wording is in:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-14a-staging-target-isolation-deployment-auth-closure-result/next-phase-prompt.md
```
