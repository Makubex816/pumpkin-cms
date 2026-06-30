# Managed API Route Inclusion Result

Managed API route readiness passed before deployment.

Included API package:

- `api/functions/static-contact-health.js`
- `api/functions/static-contact.js`
- `api/host.json`
- `api/package.json`

Runtime model:

- Azure Functions v3 function.json model.
- Node 20 target.
- Public health route: `/api/static-contact-health`.
- Public contact route: `/api/static-contact`.

No POST route execution occurred in V2.8.45D.
