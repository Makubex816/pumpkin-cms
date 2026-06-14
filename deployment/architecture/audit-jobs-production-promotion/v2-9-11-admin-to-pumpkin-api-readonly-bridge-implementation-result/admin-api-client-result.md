# Admin API Client Result

The new Admin client is `apps/admin/src/lib/audit-jobs/api-provider.ts`.

It calls exactly these GET endpoints:

- `/viewer-summary`
- `/events`
- `/job-runs`
- `/promotion-gates`
- `/evidence-bindings`
- `/traces`
- `/blockers`
- `/next-gates`

Each response must satisfy:

- `ok: true`;
- HTTP status `200`;
- `readOnly: true`;
- `providerMode: api-local-fixture-readonly`;
- local/no-write security boundary;
- zero open write flags;
- no meta flags for crawling, CMS calls, CMS writes, provider writes, protected config reads, write actions, deployment, or Search Console indexing.

The client composes route envelopes into one shared viewer model for the existing Admin adapter.
