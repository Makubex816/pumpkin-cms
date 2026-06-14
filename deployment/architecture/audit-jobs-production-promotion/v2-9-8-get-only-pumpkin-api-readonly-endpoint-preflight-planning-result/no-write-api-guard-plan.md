# No-Write API Guard Plan

Status: planned only.

Static route guard requirements:

- route registration scan must allow only `MapGet` under `/api/admin/audit-jobs`;
- scan must fail if `MapPost`, `MapPut`, `MapPatch`, `MapDelete`, or write endpoint groups appear under the Audit Jobs route family;
- route descriptions must include read-only/no-write text;
- route tags should be `Admin - Audit Jobs`.

Runtime guard requirements:

- all envelopes return `readOnly: true`;
- all provider metadata sets `writeActionsAllowed: false` or equivalent;
- all security boundary flags remain closed;
- service constructors must not receive CMS write, provider write, deployment, indexing, contact-form, Azure mutation, or secret access services;
- future action DTOs must remain disabled or omitted.

Test requirements:

- scan route source for write method registrations;
- scan contracts for mutation action states;
- assert no route returns write-action commands;
- assert every success and error response is read-only;
- assert Google/Search Console/indexing remains deferred.

