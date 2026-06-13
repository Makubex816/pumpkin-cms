# Current State Summary

Status: complete; production release remains unverified.

V2.8.17B satisfied the hard precondition:

- PowerShell saw `SWA_CLI_DEPLOYMENT_TOKEN`: `True`.
- Node saw `process.env.SWA_CLI_DEPLOYMENT_TOKEN`: `true`.
- The operator confirmed the token was the replacement token for `swa-ice-static-staging` in `rg-ice-static-staging`.
- The token value was not printed, logged, written, exported, listed, committed, or revealed.

The approved production target is still `swa-ice-static-staging`, not `swa-ice-static-isolated-staging`.

Artifact gates passed for `sanitized_20260613140129`, but the single corrective production deployment attempt failed with SWA CLI exit code `1`. No retry remains authorized and no production-domain GET checks were run.

