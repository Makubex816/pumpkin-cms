# V2.8.24 Carryforward

V2.8.24 deployed the CommonJS Azure Functions v4 entrypoint candidate to isolated staging exactly once.

Carryforward facts:

- The deployment succeeded.
- `/contact` still serialized `/api/static-contact`.
- `OPTIONS /api/static-contact` returned 204.
- The single approved synthetic isolated POST returned 404 with an empty body.
- Trace ID: `v2-8-24-isolated-contact-20260625211731`.
- No retry was sent.

V2.8.25 therefore needed to prove whether SWA managed API discovery was failing generally or whether the failure was specific to the v4 package shape.
