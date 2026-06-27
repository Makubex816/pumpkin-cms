# V2.8.32J Pumpkin API Health Fix Live Deployment Report

Date: 2026-06-27

Lane: V2.8 Tenant Website / Post-Release Contact Verification + Pumpkin Live Runtime Wiring

Classification: `pumpkin_api_locally_validated_health_fix_deploy_once_live_health_promotion`

Status: live Pumpkin API health recovered.

## Summary

V2.8.32J deployed the V2.8.32I locally validated null-safe JWT health fix exactly once to the existing Central US Web App:

`app-pumpkin-api-prod-centralus-001`

The carried-forward fixed artifact was present and SHA-verified:

`.tmp/v2-8-32i/pumpkin-api-health-recovery-local-fixed-posix.zip`

SHA256:

`722BC5B481043FF0B9B9B4566B2B23A52D93E7D6FDF3378087352F4904276D58`

No rebuild was required.

## Deployment

Deployment id:

`e224d49c-4db7-40ca-b0e1-f6bffedbf8ab`

Azure result:

- Status: `RuntimeSuccessful`
- Successful instances: `1`
- Failed instances: `0`

## Live Health

Only the approved health URLs were checked.

| URL | Status |
| --- | --- |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | `200 OK` |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | `200 OK` |

Both responses returned dependency-light health JSON with `providerStatus` set to `not_checked`.

## Canonical API URL

The Central US URL is now promoted as the canonical future `PUMPKIN_API_URL`:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`

## Boundary

No source implementation changes were made in V2.8.32J. No contact POST, production API write beyond health GET, FormEntry read/write, Admin live API read, provider/contact secret binding, Azure app settings list/show/set, protected config read, Key Vault access, keys/listKeys, connection string/SAS generation, DNS mutation, Search Console/indexing, deployment token action, provider login, or arbitrary outbound URL check occurred.

Full result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32j-pumpkin-api-health-fix-live-deployment-result/`
