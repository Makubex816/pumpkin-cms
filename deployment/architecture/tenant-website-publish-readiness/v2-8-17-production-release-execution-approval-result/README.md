# V2.8.17 Production Release Execution Approval Result

Status: complete; classified `production_deployment_failed`.

V2.8.17 crossed the approved production deployment boundary only after all pre-production gates passed. Exactly one deployment attempt was sent to `swa-ice-static-staging` in `rg-ice-static-staging` using the fresh sanitized Ice artifact `sanitized_20260613014405`.

The deployment failed with exit code `1`. No broad retry was attempted. Production-domain route verification was not run because deployment success was not reached.

Final decision:

```text
production_deployment_failed
```

Next phase requires a separate explicit approval for deployment failure triage and any future reattempt.

