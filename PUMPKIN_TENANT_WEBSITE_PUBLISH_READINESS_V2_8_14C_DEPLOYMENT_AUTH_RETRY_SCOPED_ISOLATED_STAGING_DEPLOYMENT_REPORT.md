# Pumpkin Tenant Website Publish Readiness V2.8.14C Deployment Auth Retry Scoped Isolated Staging Deployment Report

Status: complete; classified `blocked_before_deployment_auth_missing`.

Result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-14c-deployment-auth-retry-scoped-isolated-staging-deployment-result/
```

Tracker recommendation:

- Current reference: `V2.8.14C`
- Current lane: `V2.8 Tenant Website / Publish Readiness`
- Provisional V2 overall completion: `92%`
- V2.8 completion: `99%`
- Layer refs: `L01`, `L02`, `L03`, `L04`, `L06`, `L07`, `L08`, `L09`, `L10`, `L11`, `L12`, `L15`
- Next recommended reference: `V2.8.14D Deployment Auth Session Injection And Isolated Staging Deploy`

## What Is Complete

- Reviewed the V2.8.14B auth-blocked deployment boundary.
- Confirmed the isolated target exactly as `swa-ice-static-isolated-staging` in `rg-ice-static-staging`.
- Confirmed the default hostname exactly as `kind-island-0a85a740f.7.azurestaticapps.net`.
- Confirmed the isolated target has no custom domains.
- Confirmed `SWA_CLI_DEPLOYMENT_TOKEN` is absent by presence-only check.
- Confirmed pinned SWA CLI tooling is available through `npx --yes @azure/static-web-apps-cli@2.0.9`.
- Rebuilt and validated a fresh sanitized Ice static artifact.
- Stopped before deployment.

## What Remains Not Ready

`SWA_CLI_DEPLOYMENT_TOKEN` is absent from the current terminal session. The scoped staging deployment cannot execute until that env var is present.

## Pre-Deployment Gate Result

| Gate | Result |
| --- | --- |
| Isolated target exact name | passed |
| Isolated target default hostname | passed |
| Isolated target custom domains | passed, empty |
| Deployment auth | blocked, `SWA_CLI_DEPLOYMENT_TOKEN` absent |
| Pinned deployment tooling | passed |
| Sanitized artifact | passed |
| Static output validator | passed |
| Staging package validator | passed |
| Artifact security scan | passed |

## Deployment Result

Deployment was not attempted.

Reason:

```text
SWA_CLI_DEPLOYMENT_TOKEN is absent from the current terminal session.
```

No deployment to the old target or production occurred.

## Post-Deploy Route Checks

Post-deploy route checks were not attempted because deployment did not execute.

Allowed future route checks remain:

```text
https://kind-island-0a85a740f.7.azurestaticapps.net/
https://kind-island-0a85a740f.7.azurestaticapps.net/service-areas
https://kind-island-0a85a740f.7.azurestaticapps.net/contact
```

## Artifact Candidate

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612233427/repo/apps/ice-rink-web/out
```

- File count: `41`
- Aggregate SHA-256: `3e34dd29a7d91a623fd698f788d4ce86066c4dabf643bb1ec25fe04ea8cf32e8`
- Required routes present: `/`, `/service-areas`, `/contact`
- Required files present: `sitemap.xml`, `robots.txt`
- High-confidence secret-like matches: `0`
- Forbidden artifact path matches: `0`

## Validation

- `npm run build:static:ice:sanitized`: passed, `sanitized_20260612233427`.
- `npm run validate:static:ice`: passed with 34 existing warnings.
- `npm run type-check`: passed.
- `node scripts/static-publish.mjs generate`: passed with 34 existing warnings.
- Static output validator: passed.
- Staging package validator: passed.
- Runtime QA check: passed.
- Runtime QA evidence run/validation: passed, `runtimeqa_db6cbc9066631680`, 1 warning.
- Resource Registry operational bindings: passed.
- OLM provider profile check: passed; live writes disabled.
- Static form endpoint package check/tests: passed.
- Deployment readiness wrapper: blocked only by missing `SWA_CLI_DEPLOYMENT_TOKEN`.

## Security Boundary

Confirmed no deployment to `swa-ice-static-staging`, production deployment, static artifact deployment, DNS change, custom domain mutation, indexing, live publication, external crawling, outbound URL check, contact form submission, contact endpoint POST, CMS write, provider write, Azure infrastructure creation, Azure infrastructure configuration mutation, app settings mutation, RBAC assignment, protected config read, `.env.local` read/print/copy/move/rename/parse/source/modify, deployment-token print/export/listing/logging, Key Vault secret query, keys/listKeys, connection string generation, or SAS generation occurred.

Exact next approval wording is in:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-14c-deployment-auth-retry-scoped-isolated-staging-deployment-result/next-phase-prompt.md
```
