# Pumpkin Tenant Website Publish Readiness V2.8.17A Production Deployment Failure Forensics Corrective Retry Report

Status: complete; classified `blocked_token_target_ambiguous`.

Result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-17a-production-deployment-failure-forensics-corrective-retry-result/
```

Tracker recommendation:

- Current reference: `V2.8.17A`
- Current lane: `V2.8 Tenant Website / Publish Readiness`
- Provisional V2 overall completion: `94%`
- V2.8 completion: production deployment failure forensics complete; corrective retry blocked before deployment by deployment-token validity
- Layer refs: `L01`, `L02`, `L03`, `L04`, `L06`, `L07`, `L08`, `L09`, `L10`, `L11`, `L12`, `L15`
- Next recommended reference: `V2.8.17B Production Deployment Auth Replacement And Corrective Retry Approval`

## What Is Complete

- Reviewed the V2.8.17 production deployment failure root report and result package.
- Reconfirmed the production target as `swa-ice-static-staging` in `rg-ice-static-staging`.
- Reconfirmed production domains `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com` are attached and `Ready`.
- Confirmed the corrective target is not `swa-ice-static-isolated-staging`.
- Confirmed `SWA_CLI_DEPLOYMENT_TOKEN` is present by boolean-only checks in PowerShell and Node.
- Confirmed pinned SWA CLI tooling version `2.0.9`.
- Ran a non-deploying corrected SWA CLI dry-run from the validated artifact root with `--swa-config-location .`.
- Rebuilt and revalidated a fresh sanitized Ice static artifact.
- Classified the V2.8.17 failure as deployment auth/token validity, not artifact-root safety, DNS, custom-domain, indexing, or route-output failure.
- Blocked before corrective production deployment retry.

## What Remains Not Ready

Production release is not verified. The current process environment contains `SWA_CLI_DEPLOYMENT_TOKEN`, but the SWA deployment client rejected it during dry-run with `deployment_token provided was invalid`. A corrective production deployment retry is not safe until the operator loads a valid deployment token for `swa-ice-static-staging` and a separate approval authorizes the next bounded retry.

## Failure Forensics Result

V2.8.17 sent exactly one production deployment attempt and received exit code `1`. V2.8.17 also emitted an unrelated legacy `routes.json` warning from generated `.tmp` backup evidence.

V2.8.17A reran a corrected non-deploying dry-run from the artifact root:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy . --env production --dry-run --swa-config-location .
```

Result:

| Field | Value |
| --- | --- |
| Dry-run deployment | `false` |
| CLI version | `2.0.9` |
| DeploymentId emitted by dry-run | `fd39c49d-cdf2-42ee-a75a-ddb5be20108b` |
| Legacy routes warning | not reproduced |
| Deployment client result | failed |
| Failure text | `deployment_token provided was invalid` |
| Corrective retry sent | `false` |

Classification: `blocked_token_target_ambiguous`. The token is present, but process evidence does not confirm it belongs to the approved production-domain target.

## Target Reconfirmation

| Field | Value |
| --- | --- |
| Static Web App | `swa-ice-static-staging` |
| Resource group | `rg-ice-static-staging` |
| Default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| Location | `East US 2` |
| SKU | `Free` |
| Production domains | `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com` |
| Domain status | `Ready` |

## Artifact Validation

| Field | Value |
| --- | --- |
| Sanitized build run | `sanitized_20260613020714` |
| Artifact root | `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613020714/repo/apps/ice-rink-web/out` |
| File count | `41` |
| Aggregate SHA-256 | `bc48cad4d1b23721781e97b8690b85bef12861450b5ca6c9df8f159dffe71044` |
| Hash method | `sha256(sorted relative path + NUL + per-file sha256 + newline)` |
| Required routes | `/`, `/service-areas`, `/contact` present |
| Static output validator | passed, 0 errors, 0 warnings |
| Staging package validator | passed, 0 errors, 0 warnings |
| High-confidence secret-like matches | `0` |
| Forbidden artifact config files | `0` |
| Localhost matches | `1`, standard Next polyfill bundle classification |

## Deployment And Route Checks

No corrective production deployment retry was sent in V2.8.17A. Because no successful corrective deployment occurred, the six approved production-domain GET checks were not run.

## Validation

- V2.8.17 evidence review: passed.
- Azure target read-only reconfirmation: passed.
- Azure hostname read-only reconfirmation: passed, both production domains `Ready`.
- Token presence check in PowerShell: present, boolean only.
- Token presence check in Node: present, boolean only.
- SWA CLI version check: passed, `2.0.9`.
- Corrected SWA CLI dry-run: blocked by invalid deployment token, no deployment.
- `npm run build:static:ice:sanitized`: passed, `sanitized_20260613020714`.
- `npm run validate:static:ice`: passed with `34` existing warnings.
- `npm run type-check`: passed.
- `node scripts/static-publish.mjs generate`: passed after explicit Ice static env context, with `34` existing warnings.
- Static output validator: passed with static-form approval env supplied.
- Staging package validator: passed with static-form approval env supplied.
- Artifact root and security scan: passed.

## Security Boundary

Confirmed no DNS change, no custom-domain mutation, no Search Console/indexing, no contact form submission, no contact endpoint POST, no crawl, no outbound URL checks, no CMS writes, no provider writes, no Azure infrastructure creation, no Azure configuration mutation, no app settings mutation, no RBAC assignment, no protected config read, no `.env.local` read/print/copy/move/rename/parse/source/modify, no deployment token print/export/listing/logging/writing, no Key Vault secret query, no keys/listKeys, no connection string generation, no SAS generation, no broad retry, and no second corrective retry occurred.
