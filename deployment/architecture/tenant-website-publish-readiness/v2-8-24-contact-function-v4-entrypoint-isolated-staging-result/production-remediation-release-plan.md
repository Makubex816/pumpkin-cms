# Production Remediation Release Plan

Production remediation remains blocked.

Required before any production release:

- A future isolated-only phase must identify why the SWA managed API still returns 404 for POST after deploying a valid-looking v4 package.
- The future phase must deploy only to `swa-ice-static-isolated-staging` unless new explicit production approval is provided.
- The future phase must prove one synthetic isolated POST to `/api/static-contact` returns a successful public-safe response.
- The future phase must not use production contact form POSTs as discovery tests.

Candidate investigation areas for the next isolated-only phase:

- Verify SWA managed Functions supports the packaged Node v4 `package.json main` shape as deployed by SWA CLI.
- Test a canonical v4 glob entrypoint such as `main=src/functions/*.js` or a root `index.js` that requires the registration file, in isolated staging only.
- Capture deploy-package contents and CLI build behavior without printing tokens or reading protected config.
- If available and explicitly approved, use public-safe Azure/SWA deployment diagnostics that do not expose secrets and do not mutate app settings.

Production release can be considered only after isolated POST success and a new explicit production deployment approval.
