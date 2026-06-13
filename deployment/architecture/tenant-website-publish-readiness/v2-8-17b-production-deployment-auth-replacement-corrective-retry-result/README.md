# V2.8.17B Production Deployment Auth Replacement Corrective Retry Result

Status: complete; classified `corrective_deployment_failed_exit_code_1_no_retry_remaining`.

This package records the approved production deployment auth replacement and corrective retry execution for Ice static production deployment.

Outcome:

- Replacement-token precondition satisfied by boolean-only PowerShell and Node checks.
- Operator confirmed the token target as `swa-ice-static-staging` in `rg-ice-static-staging`.
- Safe read-only Azure metadata reconfirmed the production target and both production custom domains as `Ready`.
- Fresh sanitized static artifact gates passed.
- Exactly one corrective production deployment attempt was sent.
- The SWA CLI deployment failed with exit code `1`.
- No production route checks were run because deployment did not succeed.
- No retry remains authorized in this phase.

Root report:

```text
PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_17B_PRODUCTION_DEPLOYMENT_AUTH_REPLACEMENT_CORRECTIVE_RETRY_REPORT.md
```

