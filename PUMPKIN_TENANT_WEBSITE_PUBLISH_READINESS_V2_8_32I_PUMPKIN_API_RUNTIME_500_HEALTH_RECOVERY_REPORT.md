# V2.8.32I Pumpkin API Runtime 500 Health Recovery Report

Date: 2026-06-27

Lane: V2.8 Tenant Website / Post-Release Contact Verification + Pumpkin Live Runtime Wiring

Classification: `pumpkin_api_runtime_500_diagnosis_health_recovery`

Status: exact runtime 500 root cause found; local source fix validated; live health not recovered because the single approved deployment was already used before the exact null-secret root cause was proven.

## Outcome

V2.8.32I confirmed the selected Central US Web App and performed one corrected deployment attempt to `app-pumpkin-api-prod-centralus-001`. Azure reported `RuntimeSuccessful`, but both approved live health URLs still returned HTTP `500`:

- `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health`
- `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health`

After that live result, a no-secret local run from the deployed-style artifact reproduced the same HTTP `500`. The generated local runtime log showed:

`System.ArgumentNullException: Value cannot be null. (Parameter 's')`

The exception came from `System.Text.Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!)` during JWT bearer option initialization. Authentication middleware was still invoked for health requests, so missing protected JWT configuration caused health to fail before the dependency-light handler could respond.

## Fix

The source now makes JWT bearer setup null-safe. If `Jwt:SecretKey` is missing, the handler returns no authentication result instead of throwing; protected endpoints remain unauthenticated without a valid token. Health routes are also explicitly anonymous and are routed around the scoped auth branch.

Local no-secret validation from a clean artifact with no appsettings/local/env files passed:

| Path | Status |
| --- | --- |
| `/health` | `200` |
| `/api/health` | `200` |

Local fixed artifact, not deployed:

`.tmp/v2-8-32i/pumpkin-api-health-recovery-local-fixed-posix.zip`

SHA256:

`722BC5B481043FF0B9B9B4566B2B23A52D93E7D6FDF3378087352F4904276D58`

## Live Readiness

The Central US URL remains the selected API target, but it is not canonical for provider/contact binding yet because live health did not pass in this phase.

Next approval should allow one deploy of the locally validated fixed artifact/source, then GET exactly `/health` and `/api/health`.

## Boundary

No contact POST, production API write, FormEntry read/write, Admin live API read, provider/contact secret binding, Azure app settings list/show, secret app setting set, protected config read, Key Vault access, keys/listKeys, connection string/SAS generation, DNS mutation, Search Console/indexing, deployment token action, provider login, or arbitrary outbound URL check occurred.

Full result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32i-pumpkin-api-runtime-500-health-recovery-result/`
