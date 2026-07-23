# Platform deployment result

Status: `BLOCKED_BEFORE_DEPLOYMENT`.

PUB-30-A01 performed zero corrected attempts and zero deployments for:

- API;
- Admin;
- starter/shared runtime;
- retained synthetic Static Web App.

No rollback slot or package was consumed, no live app setting was written, no deployment credential was used, and no customer or synthetic runtime was changed.

Reason: a read-only API settings hash diagnostic exposed protected API configuration values in command trace. The diagnostic made no file, commit, control-plane, data-plane, or application mutation, but the affected values can no longer be treated as safely confined. The owner approval explicitly denied SWA deployment-token rotation and supplied no authority for affected API-secret rotation, so the authorized deployment sequence stopped.

Before any platform deployment, new explicit `PLATFORM_SECRET_ROTATION_AND_PARITY_RECOVERY` authority must identify the affected secret classes, authorize bounded rotation without printing or persisting values, authorize production-parity configuration recovery for API/Admin/starter as applicable, preserve customer and synthetic state, and require authoritative health/readiness, identity, forms, isolation, and deployment-identity readback.

Local acceptance froze the API deployment ZIP at SHA-256 `f616e5c0025e6d1022d7423b761d0df19c3d597e962c97f3fc94ce83d55c76e5` and the Admin deployment ZIP at SHA-256 `1a46dcc4f6d179538761cc5368c015197a6b2869bf6469e633b966beffcc6c7e`. Both were built independently in two roots, byte-matched, and passed ZIP CRC and safety scans. Neither archive was deployed or used to consume an attempt. No new starter/shared-runtime or synthetic-SWA deployment archive was presented for live use.

Final live counts are API attempts/deployments `0/0`, Admin `0/0`, starter/shared runtime `0/0`, and retained synthetic SWA `0/0`. Post-recovery production readback is `NOT_PERFORMED_SECURITY_GATE`.
