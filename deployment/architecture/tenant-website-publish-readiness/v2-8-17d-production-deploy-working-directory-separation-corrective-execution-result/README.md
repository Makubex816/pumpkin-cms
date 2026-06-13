# V2.8.17D Production Deploy Working Directory Separation Corrective Execution Result

Status: complete; classified `production_release_executed_and_verified`.

This package records the approved V2.8.17D corrective production deployment for IceSkatingRinkRentals.com.

Outcome:

- Token presence was true by boolean-only PowerShell and Node checks.
- The operator confirmed the replacement token is for production target `swa-ice-static-staging`.
- Production target `swa-ice-static-staging` in `rg-ice-static-staging` and both custom domains were reconfirmed by read-only Azure metadata.
- Fresh sanitized artifact `sanitized_20260613174033` passed static output, staging package, deploy-copy parity, and artifact security gates.
- The selected artifact was copied into a neutral temp workspace child folder named `app`.
- Exactly one corrected SWA CLI deployment was run from the neutral parent using `--app-location app --output-location .`.
- Deployment succeeded with exit code `0`; deployment id `96fd744f-5589-4ac3-bebb-cfa99048dc0e`.
- Six bounded production-domain GET checks for `/`, `/service-areas`, and `/contact` on apex and `www` returned `200 OK`.

Root report:

```text
PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_17D_PRODUCTION_DEPLOY_WORKING_DIRECTORY_SEPARATION_CORRECTIVE_EXECUTION_REPORT.md
```

