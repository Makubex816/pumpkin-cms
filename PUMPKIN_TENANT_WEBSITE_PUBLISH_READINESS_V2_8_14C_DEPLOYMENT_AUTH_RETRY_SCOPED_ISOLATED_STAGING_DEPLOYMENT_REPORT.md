# Pumpkin Tenant Website Publish Readiness V2.8.14C Deployment Auth Retry Scoped Isolated Staging Deployment Report

Status: complete; classified `staging_publish_executed_and_verified`.

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
- Next recommended reference: `V2.8.15 Post-Staging Verification And Owner Signoff`

## What Is Complete

- Confirmed `SWA_CLI_DEPLOYMENT_TOKEN` is present by boolean-only checks in PowerShell and Node.
- Confirmed pinned SWA CLI tooling: `npx --yes @azure/static-web-apps-cli@2.0.9`.
- Confirmed the isolated target exactly as `swa-ice-static-isolated-staging` in `rg-ice-static-staging`.
- Confirmed the default hostname exactly as `kind-island-0a85a740f.7.azurestaticapps.net`.
- Confirmed the isolated target has no custom domains.
- Rebuilt and validated a fresh sanitized Ice static artifact.
- Executed exactly one scoped static artifact deployment to the isolated target.
- Ran exactly three bounded GET checks on the isolated staging default hostname; all returned `200 OK`.

## What Remains Not Ready

Production release remains not approved. DNS, custom domains, indexing, live publication, contact form submission, contact endpoint POST, external crawling, outbound URL checks, CMS writes, provider writes, Azure infrastructure/configuration changes, app settings changes, RBAC assignment, protected config reads, keys/listKeys, connection strings, and SAS remain closed.

## Pre-Deployment Gate Result

| Gate | Result |
| --- | --- |
| Isolated target exact name | passed |
| Isolated target default hostname | passed |
| Isolated target custom domains | passed, empty |
| Deployment auth | passed, present by boolean-only checks |
| Pinned deployment tooling | passed, `2.0.9` |
| Sanitized artifact | passed |
| Static output validator | passed |
| Staging package validator | passed |
| Artifact security scan | passed |

## Artifact Candidate

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612235412/repo/apps/ice-rink-web/out
```

- File count: `41`
- Aggregate SHA-256: `91b4158db0bfaa97922aaf22b367a2834ca11f7012ffaf6b3152adddb16c2c21`
- Required routes present: `/`, `/service-areas`, `/contact`
- Required files present: `sitemap.xml`, `robots.txt`
- High-confidence secret-like matches: `0`
- Forbidden artifact path matches: `0`
- Localhost matches: `1`, standard Next polyfill bundle only

## Deployment Result

Deployment executed exactly once and succeeded.

Reported deployed URL:

```text
https://kind-island-0a85a740f.7.azurestaticapps.net
```

No deployment to the old target or a production custom-domain target occurred. The token value was never printed, exported, listed, logged, written to docs, committed, or displayed.

## Post-Deploy Route Checks

| Route | Result |
| --- | --- |
| `https://kind-island-0a85a740f.7.azurestaticapps.net/` | `200 OK` |
| `https://kind-island-0a85a740f.7.azurestaticapps.net/service-areas` | `200 OK` |
| `https://kind-island-0a85a740f.7.azurestaticapps.net/contact` | `200 OK` |

No crawl, outbound link follow, form submission, production-domain check, indexing trigger, or POST occurred.

## Validation

- `npm run build:static:ice:sanitized`: passed, `sanitized_20260612235412`.
- `npm run validate:static:ice`: passed with 34 existing warnings.
- `npm run type-check`: passed.
- Ice env `node scripts/static-publish.mjs generate`: passed with 34 existing warnings.
- Static output validator: passed.
- Staging package validator: passed.
- Artifact security scan: passed.
- Runtime QA check/evidence validation: passed, `runtimeqa_678e9af915877817`, 1 warning.
- Resource Registry operational bindings: passed.
- OLM local/provider profile check: passed, 132 tests.
- Static form endpoint check/tests: passed, 28 checks.
- Scoped isolated staging deployment: passed, 1 attempt.
- Bounded route checks: passed, 3 routes.

## Security Boundary

Confirmed no deployment to `swa-ice-static-staging`, no production-domain deployment, no DNS change, no custom-domain mutation, no indexing, no live publication, no external crawling, no outbound URL check, no contact form submission, no contact endpoint POST, no CMS write, no provider write, no Azure infrastructure creation, no Azure infrastructure configuration mutation beyond the scoped static artifact deployment, no app settings mutation, no RBAC assignment, no protected config read, no `.env.local` read/print/copy/move/rename/parse/source/modify, no deployment-token print/export/listing/logging/writing, no Key Vault secret query, no keys/listKeys, no connection string generation, and no SAS generation occurred.

Exact next approval wording is in:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-14c-deployment-auth-retry-scoped-isolated-staging-deployment-result/next-phase-prompt.md
```
