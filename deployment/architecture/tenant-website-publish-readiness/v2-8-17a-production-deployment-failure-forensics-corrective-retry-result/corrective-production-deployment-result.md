# Corrective Production Deployment Result

Status: not attempted.

No corrective production deployment retry was sent in V2.8.17A.

Reason:

- The current `SWA_CLI_DEPLOYMENT_TOKEN` is present by boolean-only checks.
- The corrected non-deploying SWA CLI dry-run rejected the token as invalid.
- The token target cannot be confirmed by process evidence.
- The hard precondition requires stopping before deployment when token target/validity is ambiguous.

Attempt count:

| Field | Value |
| --- | --- |
| Corrective deployment attempt sent | `false` |
| Corrective deployment attempt count | `0` |
| Broad retry | `false` |
| Second corrective retry | `false` |

No Azure content deployment occurred in this phase.
