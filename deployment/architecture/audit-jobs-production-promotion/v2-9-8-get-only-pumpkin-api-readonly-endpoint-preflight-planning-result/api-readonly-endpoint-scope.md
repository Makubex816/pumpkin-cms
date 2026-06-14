# API Read-Only Endpoint Scope

Status: planned only; no endpoint implemented.

Future base path:

`/api/admin/audit-jobs`

Allowed method:

`GET` only.

Future scope:

- expose Audit Jobs / Production Promotion governance data as read-only API envelopes;
- reuse the V2.9.6 shared viewer model and read-only API envelope contract;
- keep data partitioned by explicit `tenantKey` and `siteKey`;
- require Admin authorization and an allowed read role;
- support local fixture provider before any live provider is approved;
- return no write-capable action state;
- return no token, key, credential, connection material, secret value, raw protected config value, or private customer data.

Out of scope until a separate approval:

- POST, PUT, PATCH, DELETE routes;
- provider writes;
- CMS writes;
- deployment/indexing/contact-form actions;
- live provider wiring;
- Electron runtime;
- broad API runtime rollout.

