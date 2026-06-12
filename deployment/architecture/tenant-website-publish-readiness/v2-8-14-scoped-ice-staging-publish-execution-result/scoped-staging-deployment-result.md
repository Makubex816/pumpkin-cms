# Scoped Staging Deployment Result

Classification: `blocked_before_deployment`.

Deployment attempted: `false`.

Deployment executed: `false`.

Reason:

1. The approved target `swa-ice-static-staging` has production custom domains attached.
2. Deployment-token environment variables are absent from the current terminal session.
3. `swa` CLI is unavailable on PATH.

No Azure Static Web Apps upload command was run. No broad retry occurred.

