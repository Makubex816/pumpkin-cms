# V2.8.32H Pumpkin API Deployment 400 Diagnosis Report

Date: 2026-06-27

Status: deployment 400 resolved; live health still blocked by runtime HTTP 500.

## Summary

V2.8.32H diagnosed the Central US Web App deployment failure from V2.8.32G. The failure was not a quota or runtime-stack issue. The original ZIP contained Windows-style backslash entry names, and Kudu on Linux failed during rsync with invalid path arguments.

A corrected ZIP was repacked from the existing publish output with `/` ZIP entry separators. It was deployed exactly once to `app-pumpkin-api-prod-centralus-001` with clean/restart enabled. Azure reported `RuntimeSuccessful`.

Post-deploy live health checks were limited to the two approved routes:

| Route | Result |
| --- | --- |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | HTTP 500 |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | HTTP 500 |

## Diagnosis

The V2.8.32G OneDeploy log showed `rsync` failures for paths such as `runtimes\win-x64\native\vcruntime140.dll`. Local ZIP inspection confirmed 17 entries with backslashes.

Corrected artifact:

- Path: `.tmp/v2-8-32h/pumpkin-api-posix.zip`
- SHA256: `4F10B7A16BA066D11BAFA0BE29DE77DBBAE1A29769F71B5CCB2658CA037EB46E`
- File entries: 56
- Backslash ZIP entries: 0
- App-settings-like entries: 0

Corrected deployment:

- Deployment id: `09a22446-d448-4cea-b77f-fb7dc256af9b`
- Azure status: `RuntimeSuccessful`
- Successful instances: 1
- Failed instances: 0

## Remaining Blocker

The deployment pipeline is now healthy, but the live app is not health-ready. Local source review shows the health handler itself is dependency-light, but `UseAuthentication()` is registered before the health endpoints and JWT bearer setup dereferences `Jwt:SecretKey`. Because this phase forbids secret app setting inspection or binding, the remaining HTTP 500 is classified as a runtime startup/auth configuration blocker requiring a separate approval.

## Security Boundary

No contact POST, production API write, FormEntry read/write, Admin live API read, provider/contact secret binding, app settings list/show, secret app setting set, protected config read, Key Vault access, deployment token action, DNS mutation, Search Console/indexing action, or arbitrary outbound check was performed.

Full evidence package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-32h-pumpkin-api-deployment-400-diagnosis-result/`
