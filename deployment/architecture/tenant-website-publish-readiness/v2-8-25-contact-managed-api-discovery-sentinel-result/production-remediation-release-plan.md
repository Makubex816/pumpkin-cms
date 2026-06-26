# Production Remediation Release Plan

Production remediation is not approved in V2.8.25.

Recommended next production remediation phase:

1. Require explicit operator approval for production-bound deployment to `swa-ice-static-staging`.
2. Use the proven v3-compatible API package shape from `deployment/static-azure/forms/static-form-endpoint-compat`.
3. Build a fresh sanitized Ice static artifact.
4. Package app plus API with `staticwebapp.config.json platform.apiRuntime=node:20`.
5. Verify production-bound target and custom domains without mutation.
6. Run boolean-only deployment token checks without printing token values.
7. Deploy exactly once to `swa-ice-static-staging` only after all gates pass.
8. Verify production `/contact`.
9. Verify production `/api/static-contact-health`.
10. Keep production live POST separately gated until health and page preflight pass.

Production should not use the V2.8.24 v4 package shape unless a future approved phase proves a corrected v4 layout.
