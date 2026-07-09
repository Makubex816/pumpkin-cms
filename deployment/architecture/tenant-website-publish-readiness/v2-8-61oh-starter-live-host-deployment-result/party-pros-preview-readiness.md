# Party Pros Preview Readiness

Party Pros preview status: not enabled in V2.8.61OH.

Reason:

- The shared starter host is intentionally not Party Pros-only.
- This phase did not approve tenant API key or tenant-specific secret appsettings.
- This phase did not approve Party Pros page publishing.
- Party Pros records and media were not mutated.

Current useful state:

- The shared starter host is live and can render the bundled starter shell.
- The host has the public Pumpkin API base URL configured.
- The host does not have `PUMPKIN_TENANT_ID` or `PUMPKIN_API_KEY`, so it is not bound to Party Pros.

V2.8.61OI should approve a read-only preview binding strategy, including whether to use a secure tenant API key handoff, a server-side preview token, or a source-supported authenticated preview route.
