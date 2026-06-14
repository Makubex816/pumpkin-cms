# Future Bridge Implementation Boundary Summary

V2.9.11 is the next implementation boundary.

Allowed in V2.9.11 after approval:

- Admin read-only API client;
- provider mode switch between fixture and API;
- adapter support for `api-local-fixture-readonly` envelopes in `admin-api-readonly` mode;
- API-to-Admin viewer model normalization;
- fallback/degraded state UI;
- tests and runtime QA for API-backed Admin mode.

Still not allowed without separate approval:

- new Pumpkin API routes;
- POST/PUT/PATCH/DELETE Audit Jobs endpoints;
- provider writes;
- CMS writes;
- live provider integration;
- deployment or redeployment;
- DNS or custom-domain mutation;
- Google/Search Console/indexing actions;
- contact-form submission;
- Azure mutation or RBAC;
- protected config reads;
- token/key listing or printing;
- connection material or SAS generation;
- Electron runtime.

