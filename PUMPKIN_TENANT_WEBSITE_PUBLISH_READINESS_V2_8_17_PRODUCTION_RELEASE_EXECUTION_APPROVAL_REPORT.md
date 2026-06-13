# Pumpkin Tenant Website Publish Readiness V2.8.17 Production Release Execution Approval Report

Status: complete; classified `production_deployment_failed`.

Result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-17-production-release-execution-approval-result/
```

Tracker recommendation:

- Current reference: `V2.8.17`
- Current lane: `V2.8 Tenant Website / Publish Readiness`
- Provisional V2 overall completion: `94%`
- V2.8 completion: production execution approval processed; one production deployment attempt failed before route verification
- Layer refs: `L01`, `L02`, `L03`, `L04`, `L06`, `L07`, `L08`, `L09`, `L10`, `L11`, `L12`, `L15`
- Next recommended reference: `V2.8.18 Production Deployment Failure Triage And Reattempt Approval`

## What Is Complete

- Reviewed V2.8.16 production release planning, V2.8.15 isolated staging signoff, V2.8.14C isolated staging deployment evidence, and V2.8.13 backend verification.
- Confirmed the approved production target is `swa-ice-static-staging` in `rg-ice-static-staging`.
- Confirmed production domains `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com` are already attached to that target with `Ready` status.
- Confirmed the deployment target is not `swa-ice-static-isolated-staging`.
- Confirmed `SWA_CLI_DEPLOYMENT_TOKEN` is present by boolean-only checks in PowerShell and Node.
- Confirmed pinned SWA CLI tooling version `2.0.9`.
- Built fresh sanitized static artifact `sanitized_20260613014405`.
- Revalidated static source, static generation, static output, staging package, artifact root, artifact security, Runtime QA, Resource Registry, OLM, and static form endpoint gates.
- Sent exactly one production static artifact deployment attempt to the approved target boundary.
- Stopped after the deployment failure and did not retry.

## What Remains Not Ready

Production release is not verified. The deployment command failed with exit code `1`, so production-domain route checks were not run. A future reattempt requires a separate explicit approval after failure triage.

## Production Target Confirmation

| Field | Value |
| --- | --- |
| Static Web App | `swa-ice-static-staging` |
| Resource group | `rg-ice-static-staging` |
| Default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| Production domains | `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com` |
| Domain status | `Ready` |
| Confirmed by | Azure read-only metadata |

## Artifact

| Field | Value |
| --- | --- |
| Sanitized build run | `sanitized_20260613014405` |
| Artifact root | `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613014405/repo/apps/ice-rink-web/out` |
| File count | `41` |
| Aggregate SHA-256 | `b525b9fc70f32206c17b860a4f29579a26c350394272171bb021a2904fd2b042` |
| Hash method | `sha256(sorted relative path + NUL + per-file sha256 + newline)` |
| Required routes | `/`, `/service-areas`, `/contact` present |
| Required files | `sitemap.xml`, `robots.txt` present |

## Deployment Result

Exactly one production deployment attempt was sent:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy "<validated-artifact-root>" --env production
```

Result:

| Field | Value |
| --- | --- |
| Attempt count | `1` |
| Target | `swa-ice-static-staging` / `rg-ice-static-staging` |
| Deployment result | failed |
| Exit code | `1` |
| Reported URL | none |
| Broad retry | `false` |
| Failure summary | SWA CLI reported `Deployment failed with exit code 1`; deployment binary exited with code `1` |

## Post-Deployment Route Checks

Post-deployment route checks were not run because the production deployment did not succeed. The six approved production-domain GET checks remain pending for a separately approved successful deployment path.

## Validation

- `npm run build:static:ice:sanitized`: passed, `sanitized_20260613014405`.
- `npm run validate:static:ice`: passed with `34` existing warnings.
- `npm run type-check`: passed.
- `node scripts/static-publish.mjs generate`: passed with `34` existing warnings.
- Static output validator: passed, 0 errors, 0 warnings.
- Staging package validator: passed, 0 errors, 0 warnings.
- Artifact root and security scan: passed.
- Runtime QA check: passed, 6 tests.
- Runtime QA evidence run: `runtimeqa_b876ce99824cee8e`.
- Runtime QA evidence validation: passed with 1 warning.
- Resource Registry operational bindings: passed, 0 failures, 0 warnings.
- OLM local/provider profile check: passed, 132 tests.
- Static form endpoint check/tests: passed, 28 checks.
- Production static deployment: failed, 1 attempt, no retry.

## Security Boundary

Confirmed no DNS change, no custom-domain mutation, no Search Console/indexing, no contact form submission, no contact endpoint POST, no crawl, no outbound URL checks, no CMS writes, no provider writes, no Azure infrastructure creation, no Azure configuration mutation beyond the single attempted static artifact deployment boundary, no app settings mutation, no RBAC assignment, no protected config read, no `.env.local` read/print/copy/move/rename/parse/source/modify, no deployment token print/export/listing/logging/writing, no Key Vault secret query, no keys/listKeys, no connection string generation, and no SAS generation occurred.

