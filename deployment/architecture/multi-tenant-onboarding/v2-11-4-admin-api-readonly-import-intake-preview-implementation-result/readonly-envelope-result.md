# Read-Only Envelope Result

All API responses are wrapped in `ImportIntakeReadOnlyApiEnvelopeDto<T>`.

Envelope guarantees:

- `readOnly: true`;
- provider mode `api-local-import-package-fixture-readonly`;
- local-only meta;
- no write actions allowed;
- CMS writes false;
- provider writes false;
- protected config reads false;
- deployment false;
- Search Console/indexing false;
- Google indexing state `deferred_hard_stop`;
- read-only error envelopes for missing provider/package cases.
