# Current State Summary

Status: `production_deployment_failed`.

All required pre-production gates passed. The production target is exactly `swa-ice-static-staging` in `rg-ice-static-staging`, and the production domains are already attached.

Exactly one production static deployment attempt was sent. It failed with exit code `1`. No retry was attempted, and post-deploy production route checks were not run.

