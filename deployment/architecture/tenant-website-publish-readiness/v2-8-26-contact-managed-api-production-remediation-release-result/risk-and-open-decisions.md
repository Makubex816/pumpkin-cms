# Risk And Open Decisions

Resolved in V2.8.26:

- Production managed API discovery works with the v3-compatible `function.json` package.
- Production `/contact` points to `/api/static-contact`.
- Production health endpoint returns 200 with `ok: true`.
- Exactly one synthetic production POST returns 200 with `ok: true` and an entry ID.

Open:

- Backend delivery confirmation remains pending operator confirmation.
- No additional production POST should be sent without a new explicit approval.
- Search Console/indexing remains separately gated and was not run in this phase.

Observation:

- The production OPTIONS method check returned 204, but the Node response did not expose CORS allow headers. Because the production form uses the same-origin `/api/static-contact` path, this did not block the live same-origin POST verification.
