# Production Remediation Release Plan

Production remains blocked until a future isolated-only phase proves the next-candidate managed API route.

Required next isolated phase:

1. Use the local CommonJS API entrypoint shape.
2. Build a sanitized static artifact.
3. Build an isolated app plus API package with `src/functions/static-contact.js`.
4. Run local static/API/readiness checks.
5. Deploy exactly once to `swa-ice-static-isolated-staging`.
6. Submit exactly one synthetic isolated POST only after preflight.
7. If isolated POST succeeds, prepare production release approval.

Production deployment must remain unapproved until isolated POST returns success.

