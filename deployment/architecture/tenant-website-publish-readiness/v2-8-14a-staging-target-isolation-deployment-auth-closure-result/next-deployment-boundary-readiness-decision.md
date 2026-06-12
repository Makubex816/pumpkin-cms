# Next Deployment Boundary Readiness Decision

Decision: `blocked_auth_missing`.

Ready:

- Isolated staging target exists.
- Isolated target has no custom domains.
- Repo-supported SWA CLI path is available through pinned `npx`.
- Local deployment readiness wrapper exists.
- Sanitized artifact validates.

Not ready:

- `SWA_CLI_DEPLOYMENT_TOKEN` is not present in the current terminal session.

No-go until resolved:

- Do not deploy until the isolated target token is supplied as `SWA_CLI_DEPLOYMENT_TOKEN`.
- Do not deploy to `swa-ice-static-staging`.
- Do not use production custom domains.
- Do not print, list, or commit deployment token values.

