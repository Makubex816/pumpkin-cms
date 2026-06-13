# Production Release Readiness Decision

Decision:

```text
production_deployment_failed
```

All pre-production gates passed, and one approved production static deployment attempt was sent. The deployment failed with exit code `1`.

Because deployment did not succeed:

- production release is not verified;
- production route checks were not run;
- no retry was attempted;
- any future deployment reattempt requires separate explicit approval.

