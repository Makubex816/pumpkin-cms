# V2.8.17C Production Deploy Command Shape Corrective Execution Result

Status: complete; classified `production_deployment_failed_command_shape`.

This package records the approved V2.8.17C command-shape corrective production deployment attempt for IceSkatingRinkRentals.com.

Outcome:

- Token presence was true by boolean-only PowerShell and Node checks.
- V2.8.17C approval context carried forward that the env token already matched the current Azure deployment token for `swa-ice-static-staging`.
- Production target and both production custom domains were reconfirmed as `Ready` using safe read-only Azure metadata.
- Fresh sanitized artifact `sanitized_20260613172317` passed static output, staging package, and security gates.
- Exactly one corrected deployment attempt was sent from the artifact root with explicit app name/resource group and no dry-run.
- The SWA deployment client failed with exit code `1`.
- Route verification was not run because deployment did not succeed.

Root report:

```text
PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_17C_PRODUCTION_DEPLOY_COMMAND_SHAPE_CORRECTIVE_EXECUTION_REPORT.md
```

