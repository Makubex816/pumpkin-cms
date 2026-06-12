# Staging Publish Execution Readiness Decision

Decision: `blocked_before_deployment_auth_missing`.

Ready:

- Isolated target exists and is exact.
- Isolated target has no custom domains.
- Pinned SWA CLI tooling is available.
- Sanitized artifact validates.
- Static output and staging package validators pass.
- Supporting Runtime QA, Resource Registry, provider profile, and form endpoint checks pass.

Blocked:

- `SWA_CLI_DEPLOYMENT_TOKEN` is absent.

Next action:

- Supply `SWA_CLI_DEPLOYMENT_TOKEN` in the same terminal session and rerun the scoped isolated staging deployment approval.

