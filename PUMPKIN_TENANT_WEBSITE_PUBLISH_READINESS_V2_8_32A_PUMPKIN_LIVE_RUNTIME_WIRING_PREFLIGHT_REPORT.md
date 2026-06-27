# Pumpkin Tenant Website Publish Readiness V2.8.32A Pumpkin Live Runtime Wiring Preflight Report

Date: 2026-06-27

Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/`

## Executive result

V2.8.32A is complete as a read-only preflight. No deployment, production contact POST, Azure mutation, app setting read, protected config read, secret query, deployment-token action, DNS mutation, or production health/API call was performed.

The contact persistence gate remains open. V2.8.31 made the local static contact adapter capable of forwarding to Pumpkin API, but live Azure metadata in the active subscription does not show a deployed Pumpkin API App Service/Web App host. Current metadata shows the production Static Web App, isolated Static Web App, legacy/static contact Function App, production Cosmos account, and staging PumpkinCMS resources. The repo also contains a candidate publish-profile URL for `pumpkin-api-cdg2d3dwfpbbdygn.centralus-01.azurewebsites.net`, but current `az webapp list` returned no Web Apps, so that URL is not verified as a live resource.

Recommendation: do not attempt production contact persistence binding yet. The next approved phase should first verify or create/expose the live Pumpkin API runtime, then bind that runtime to the production Cosmos provider, then bind Admin and static contact paths to that single API base URL.

## Live metadata result

Safe Azure metadata-only commands were run in subscription `ff887def-fd83-4a19-9298-13d4b1687873`:

| Check | Result |
| --- | --- |
| `az webapp list` | Returned `[]`; no App Service/Web App host is currently visible. |
| `az functionapp list` | Returned `func-ice-static-contact-20260605`, Running, `rg-ice-static-form-endpoint`. |
| `az staticwebapp list` | Returned `swa-ice-static-staging` and `swa-ice-static-isolated-staging`. |
| Production SWA hostnames | `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com` are Ready on `swa-ice-static-staging`. |
| Isolated SWA hostnames | None configured. |
| Cosmos accounts | `cosmos-pumpkin-prod-eastus` and `cosmos-pumpkincms-stg-olm01` exist. |
| Production Cosmos database | `pumpkin-prod-cms` exists. |
| Production Cosmos containers | `forms`, `importRuns`, `routes`, `mediaAssets`, `users`, `themes`, `pages`, `sites`, `tenants`, `publishRuns`. |

## Carryforward

V2.8.26 proved the public production contact form can reach the same-origin static contact path. V2.8.28 showed that accepted submissions were not visible in Admin. V2.8.29 identified the root cause: the static contact path accepted payloads but did not persist `FormEntry` records unless forwarding to Pumpkin API. V2.8.30 selected the `admin-persistence-required` path. V2.8.31 implemented the local static adapter behavior for explicit Pumpkin API forwarding with a protected API key binding.

V2.8.32A rebaselines that work against current live runtime reality: the public SWA and Cosmos resources exist, but a live Pumpkin API host is not visible in current Azure Web App metadata.

## Required next sequence

1. Verify or create/expose the live Pumpkin API runtime resource.
2. Prove non-secret provider metadata for that runtime and bind it to the intended Cosmos provider under a protected approval.
3. Bind Admin `NEXT_PUBLIC_API_URL` to the same Pumpkin API base URL and verify read-only form-entry visibility.
4. Bind the static contact managed API to Pumpkin API mode on the isolated lane first.
5. Run an approved runtime QA sequence, including exactly one controlled non-production or isolated contact write before any production write.
6. Only after the isolated path passes, request a separate production binding/cutover approval with rollback.

## Files created

- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/README.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/result-manifest.json`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/current-state-summary.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/v2-8-26-through-v2-8-31-carryforward.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/pumpkin-live-runtime-inventory.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/resource-state-matrix.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/pumpkin-api-live-resource-verification.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/admin-to-pumpkin-api-wiring-map.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/public-contact-to-pumpkin-api-persistence-map.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/form-entry-write-read-topology.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/protected-binding-app-setting-matrix.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/resource-registry-provider-profile-gap-list.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/backup-center-runtime-qa-requirements.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/deployment-and-rollback-lane-plan.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/validation-runtime-qa-matrix.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/prioritized-implementation-sequence.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/contact-gate-status.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/deferred-gates-summary.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/security-boundary-result.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/no-deploy-no-post-confirmation.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/risk-and-open-decisions.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/next-phase-prompt.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/validation-summary.md`

## Commit guidance

Stage only the V2.8.32A root report and result package paths:

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32A_PUMPKIN_LIVE_RUNTIME_WIRING_PREFLIGHT_REPORT.md
git add deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result
git commit -m "Record V2.8.32A Pumpkin live runtime wiring preflight"
```
