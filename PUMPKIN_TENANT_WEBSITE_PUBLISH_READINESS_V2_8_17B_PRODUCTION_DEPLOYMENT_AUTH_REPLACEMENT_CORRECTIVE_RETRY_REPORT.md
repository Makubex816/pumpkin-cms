# Pumpkin Tenant Website Publish Readiness V2.8.17B Production Deployment Auth Replacement Corrective Retry Report

Status: complete; classified `corrective_deployment_failed_exit_code_1_no_retry_remaining`.

Result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-17b-production-deployment-auth-replacement-corrective-retry-result/
```

Tracker recommendation:

- Current reference: `V2.8.17B`
- Current lane: `V2.8 Tenant Website / Publish Readiness`
- Provisional V2 overall completion: `94%`
- V2.8 completion: production deployment retry authorization consumed; production release remains unverified because the single corrective SWA CLI deployment attempt failed with exit code `1`
- Layer refs: `L01`, `L02`, `L03`, `L04`, `L06`, `L07`, `L08`, `L09`, `L10`, `L11`, `L12`, `L15`
- Next recommended reference: `V2.8.17C Production Deployment Failure Forensics And Tooling/Auth Remediation Plan`

## What Is Complete

- Verified `SWA_CLI_DEPLOYMENT_TOKEN` presence in PowerShell and Node by boolean-only checks.
- Recorded operator confirmation that the token is the replacement token for production target `swa-ice-static-staging` in `rg-ice-static-staging`.
- Reconfirmed `swa-ice-static-staging` using safe read-only Azure metadata.
- Reconfirmed production domains `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com` are attached and `Ready`.
- Confirmed the deployment target was not `swa-ice-static-isolated-staging`.
- Confirmed pinned SWA CLI tooling version `2.0.9`.
- Rebuilt a fresh sanitized Ice static artifact with the approved public static form endpoint environment.
- Revalidated Ice static source, type checking, static artifact generation, static output, staging package, artifact root selection, and artifact security.
- Sent exactly one corrective production deployment attempt from the validated artifact root.
- Stopped after the failed deployment attempt; no broad retry and no second corrective retry occurred.

## What Remains Not Ready

Production release is not verified. The V2.8.17B replacement-token precondition was satisfied, but the single approved corrective SWA CLI production deployment attempt failed with exit code `1`. Because no successful deployment occurred, the six production-domain GET checks were not run.

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
| Selected sanitized build run | `sanitized_20260613140129` |
| Artifact root | `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613140129/repo/apps/ice-rink-web/out` |
| File count | `41` |
| Aggregate SHA-256 | `8f88a08d9c0c13f34fb229f88e02e381923ef66754a0ad50b0636796c9766a9e` |
| Hash method | `sha256(sorted relative path + NUL + per-file sha256 + newline)` |
| Required routes | `/`, `/service-areas`, `/contact` present |
| Static output validator | passed, 0 errors, 0 warnings |
| Staging package validator | passed, 0 errors, 0 warnings |
| High-confidence secret-like matches | `0` |
| Forbidden artifact config files | `0` |
| Localhost matches | `0` |

## Deployment Result

Exactly one corrective production deployment attempt was sent:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy . --env production --swa-config-location .
```

The command was run from the selected artifact root. It failed with exit code `1`. The SWA CLI output reported that the deployment binary exited with code `1`; it did not emit a successful deployment result. No retry was attempted.

## Route Checks

No production-domain GET checks were run. The approved checks for `/`, `/service-areas`, and `/contact` on both apex and `www` domains were conditional on a successful deployment, and the deployment failed.

## Security Boundary

Confirmed no DNS change, no custom-domain mutation, no Search Console/indexing, no contact form submission, no contact endpoint POST, no crawl, no outbound URL checks, no CMS writes, no provider writes, no Azure infrastructure creation, no Azure configuration mutation beyond the failed static artifact deployment attempt, no app settings mutation, no RBAC assignment, no protected config read, no `.env.local` read/print/copy/move/rename/parse/source/modify, no deployment token print/export/listing/logging/writing, no Key Vault secret query, no keys/listKeys, no connection string generation, no SAS generation, no broad retry, and no second corrective retry.

