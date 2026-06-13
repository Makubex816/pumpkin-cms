# Pumpkin Tenant Website Publish Readiness V2.8.17D Production Deploy Working Directory Separation Corrective Execution Report

Status: complete; classified `production_release_executed_and_verified`.

Result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-17d-production-deploy-working-directory-separation-corrective-execution-result/
```

Tracker recommendation:

- Current reference: `V2.8.17D`
- Current lane: `V2.8 Tenant Website / Publish Readiness`
- Provisional V2 overall completion: `95%`
- V2.8 completion: production static deployment executed and verified for the approved Ice routes; Search Console, indexing, owner post-launch signoff, and any future DNS/custom-domain change remain separately gated
- Layer refs: `L01`, `L02`, `L03`, `L04`, `L06`, `L07`, `L08`, `L09`, `L10`, `L11`, `L12`, `L15`
- Next recommended reference: `V2.8.18 Production Post-Deployment Owner Verification And Indexing Approval Packet`

## What Is Complete

- Verified `SWA_CLI_DEPLOYMENT_TOKEN` presence in PowerShell and Node by boolean-only checks.
- Accepted the operator confirmation that the replacement token is for production target `swa-ice-static-staging`.
- Reconfirmed production target `swa-ice-static-staging` in `rg-ice-static-staging` using safe read-only Azure metadata.
- Reconfirmed production domains `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com` are attached and `Ready`.
- Confirmed SWA CLI version `2.0.9`.
- Rebuilt fresh sanitized Ice static artifact `sanitized_20260613174033`.
- Revalidated Ice static source, type checking, static artifact generation, static output, staging package, artifact root selection, deploy-workspace copy parity, and artifact security.
- Copied the validated artifact into a neutral deployment workspace child folder named `app`.
- Ran exactly one corrected production deployment from the neutral parent with `--app-location app --output-location .`.
- Verified the production deployment succeeded with exit code `0` and deployment id `96fd744f-5589-4ac3-bebb-cfa99048dc0e`.
- Ran exactly six bounded production-domain GET checks; all returned `200 OK`.

## What Remains Not Ready

The approved production static deployment and technical route verification are complete. The remaining gates are post-launch owner verification, Search Console/indexing approval, any future DNS/custom-domain change, contact form submission or contact endpoint POST, CMS/provider writes, and any Azure infrastructure/configuration work outside a separately approved boundary.

## Working Directory Separation Result

| Field | Value |
| --- | --- |
| Neutral deployment parent | `C:/Users/User/AppData/Local/Temp/pumpkincms-v2-8-17d-swa-production-deploy` |
| Deploy child folder | `app` |
| SWA CLI current directory | Neutral deployment parent |
| `--app-location` | `app` |
| `--output-location` | `.` |
| Deployment run from repo root | `false` |
| Deployment run from artifact root | `false` |
| Parent equals child | `false` |
| Parent contained within child | `false` |
| Child contained within parent | `true` |

V2.8.17D fixed the V2.8.17C artifact-root working-directory blocker. The same error did not recur.

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

## Artifact Root And Deploy Workspace

| Field | Value |
| --- | --- |
| Selected sanitized build run | `sanitized_20260613174033` |
| Artifact root | `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613174033/repo/apps/ice-rink-web/out` |
| Selected artifact file count | `41` |
| Selected artifact aggregate SHA-256 | `506c6b4c99bcabed162466c79b299f900c6070855b90cd6f38ffae37fceff899` |
| Deploy app file count | `41` |
| Deploy app aggregate SHA-256 | `506c6b4c99bcabed162466c79b299f900c6070855b90cd6f38ffae37fceff899` |
| Hash parity | `passed` |
| Static output validator | passed, 0 errors, 0 warnings |
| Staging package validator | passed, 0 errors, 0 warnings |
| High-confidence secret-like matches | `0` |
| Forbidden artifact config files | `0` |
| Localhost matches | `0` |

## Corrected Production Deployment Result

Exactly one V2.8.17D production deployment attempt was sent:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy --app-location app --output-location . --app-name "swa-ice-static-staging" --resource-group "rg-ice-static-staging" --env production --api-language none --api-version none --no-use-keychain --verbose=silly
```

| Field | Value |
| --- | --- |
| Attempt count | `1` |
| Exit code | `0` |
| `SWA_CLI_DEPLOY_DRY_RUN` | `false` |
| `DEPLOYMENT_ACTION` | `upload` |
| Deployment id | `96fd744f-5589-4ac3-bebb-cfa99048dc0e` |
| Deployment status | `Succeeded` |
| Broad retry | `0` |
| Second corrective retry | `0` |

## Production Route Verification

Bounded GET-only checks were run after successful deployment.

| URL | Status | Content length |
| --- | --- | ---: |
| `https://iceskatingrinkrentals.com/` | `200 OK` | `43863` |
| `https://iceskatingrinkrentals.com/service-areas` | `200 OK` | `46730` |
| `https://iceskatingrinkrentals.com/contact` | `200 OK` | `50129` |
| `https://www.iceskatingrinkrentals.com/` | `200 OK` | `43863` |
| `https://www.iceskatingrinkrentals.com/service-areas` | `200 OK` | `46730` |
| `https://www.iceskatingrinkrentals.com/contact` | `200 OK` | `50129` |

No crawl, outbound link following, form submission, or contact endpoint POST occurred.

## Security Boundary

Confirmed no DNS change, no custom-domain mutation, no Search Console/indexing, no contact form submission, no contact endpoint POST, no crawl, no outbound URL checks, no CMS writes, no provider writes, no Azure infrastructure creation, no Azure configuration mutation beyond the single successful static artifact deployment to existing `swa-ice-static-staging`, no app settings mutation, no RBAC assignment, no protected config read, no `.env.local` read/print/copy/move/rename/parse/source/modify, no deployment token print/export/listing/logging/writing/reveal, no Key Vault secret query, no keys/listKeys, no connection string generation, no SAS generation, no broad retry, and no `git add -A`.

