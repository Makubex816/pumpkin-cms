# Rollback Abort Result

Status: abort condition reached; no rollback mutation performed.

Abort trigger:

- The single corrective production deployment attempt failed with SWA CLI exit code `1`.

Actions taken:

- Stopped immediately after the failed deployment attempt.
- Did not retry.
- Did not run production-domain GET checks.
- Did not mutate DNS, custom domains, app settings, RBAC, or Azure infrastructure.

No rollback command was executed because there was no verified successful deployment in this phase.

