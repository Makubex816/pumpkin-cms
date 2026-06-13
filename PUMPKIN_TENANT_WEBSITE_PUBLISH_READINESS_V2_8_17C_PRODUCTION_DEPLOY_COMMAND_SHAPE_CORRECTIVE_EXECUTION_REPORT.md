# Pumpkin Tenant Website Publish Readiness V2.8.17C Production Deploy Command Shape Corrective Execution Report

Status: complete; classified `production_deployment_failed_command_shape`.

Result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-17c-production-deploy-command-shape-corrective-execution-result/
```

Tracker recommendation:

- Current reference: `V2.8.17C`
- Current lane: `V2.8 Tenant Website / Publish Readiness`
- Provisional V2 overall completion: `94%`
- V2.8 completion: corrected command-shape attempt consumed; production release remains unverified because the SWA deployment client rejected the artifact-root working-directory shape before successful upload
- Layer refs: `L01`, `L02`, `L03`, `L04`, `L06`, `L07`, `L08`, `L09`, `L10`, `L11`, `L12`, `L15`
- Next recommended reference: `V2.8.17D Production Deploy Working-Directory Separation Corrective Execution`

## What Is Complete

- Verified `SWA_CLI_DEPLOYMENT_TOKEN` presence in PowerShell and Node by boolean-only checks.
- Accepted the V2.8.17C approval context that the environment token had already been proven to match the current Azure deployment token for `swa-ice-static-staging`.
- Reconfirmed production target `swa-ice-static-staging` in `rg-ice-static-staging` using safe read-only Azure metadata.
- Reconfirmed production domains `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com` are attached and `Ready`.
- Confirmed SWA CLI version `2.0.9`.
- Rebuilt a fresh sanitized Ice static artifact.
- Revalidated Ice static source, type checking, static artifact generation, static output, staging package, artifact root selection, and artifact security.
- Pushed into the selected artifact root and sent exactly one corrected production deployment attempt using explicit `--app-name`, `--resource-group`, `--env production`, and `--no-use-keychain`.
- Did not use `--dry-run`.
- Stopped after the single failed deployment attempt; no broad retry and no second corrective retry occurred.

## What Remains Not Ready

Production release is not verified. The corrected attempt no longer used the dry-run/close action path, but the deployment client still failed before a successful production upload. Because no successful deployment occurred, the six approved production-domain GET checks were not run.

## Command-Shape Forensics Result

V2.8.17C corrected the V2.8.17B dry-run behavior:

| Field | V2.8.17C observed value |
| --- | --- |
| `SWA_CLI_DEPLOY_DRY_RUN` | `false` |
| `DEPLOYMENT_ACTION` | `upload` |
| Deployment provider | `SwaCli` |
| DeploymentId emitted | `b20c5b8a-b569-404d-a5b2-e3e3f0a5a946` |

New blocker:

```text
Current directory cannot be identical to or contained within artifact folders.
```

Classification: `production_deployment_failed_command_shape`.

The corrected attempt fixed the dry-run/close-action issue, but running `deploy .` from inside the artifact root still produced an invalid client working-directory/artifact relationship.

## Production Target Confirmation

| Field | Value |
| --- | --- |
| Static Web App | `swa-ice-static-staging` |
| Resource group | `rg-ice-static-staging` |
| Default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| Location | `East US 2` |
| SKU | `Free` |
| Production domains | `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com` |
| Domain status | `Ready` |

## Artifact Root Selection

| Field | Value |
| --- | --- |
| Selected sanitized build run | `sanitized_20260613172317` |
| Artifact root | `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613172317/repo/apps/ice-rink-web/out` |
| File count | `41` |
| Aggregate SHA-256 | `c34c1cbcc3f8d1a6591595e1854ff799633b04d36d00e0aa6a05f6cf67c4e216` |
| Hash method | `sha256(sorted relative path + NUL + per-file sha256 + newline)` |
| Required routes | `/`, `/service-areas`, `/contact` present |
| Static output validator | passed, 0 errors, 0 warnings |
| Staging package validator | passed, 0 errors, 0 warnings |
| High-confidence secret-like matches | `0` |
| Forbidden artifact config files | `0` |
| Localhost matches | `0` |

## Corrected Production Deployment Result

Exactly one V2.8.17C production deployment attempt was sent:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy . --app-name "swa-ice-static-staging" --resource-group "rg-ice-static-staging" --env production --no-use-keychain --verbose=silly
```

The command was run from the selected artifact root. It failed with exit code `1`. No retry was attempted.

## Production Route Verification

No production-domain GET checks were run. The approved checks for `/`, `/service-areas`, and `/contact` on both apex and `www` domains were conditional on a successful deployment, and the deployment failed.

## Security Boundary

Confirmed no DNS change, no custom-domain mutation, no Search Console/indexing, no contact form submission, no contact endpoint POST, no crawl, no outbound URL checks, no CMS writes, no provider writes, no Azure infrastructure creation, no Azure configuration mutation beyond the failed static artifact deployment attempt, no app settings mutation, no RBAC assignment, no protected config read, no `.env.local` read/print/copy/move/rename/parse/source/modify, no deployment token print/export/listing/logging/writing/reveal, no Key Vault secret query, no keys/listKeys, no connection string generation, no SAS generation, no broad retry, and no second corrective retry.

