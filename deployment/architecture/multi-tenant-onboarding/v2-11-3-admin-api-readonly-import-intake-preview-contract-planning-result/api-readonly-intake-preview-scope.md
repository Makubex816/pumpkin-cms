# API Read-Only Intake Preview Scope

Future API group:

`/api/admin/import-intake`

Scope:

- GET-only route group;
- authenticated and tenant/site scoped;
- fixture-backed local provider first;
- no POST/PUT/PATCH/DELETE routes;
- no import execution service;
- no provider/CMS/Azure writes;
- no protected config reads.

Provider mode:

`api-local-import-package-fixture-readonly`

The future API must return read-only envelopes with closed security-boundary flags and `googleIndexingState: deferred_hard_stop`.
