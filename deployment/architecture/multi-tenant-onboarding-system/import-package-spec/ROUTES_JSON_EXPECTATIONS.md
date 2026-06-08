# Routes JSON Expectations

`routes.json` is a launch safety file.

Required:

- approved routes
- forbidden routes
- canonical root behavior
- `www` behavior

Rules:

- Approved routes must be explicit.
- Forbidden routes must include old, preview, draft, duplicate, and unrelated tenant routes.
- Approved page files must match approved routes.
- Preview and obsolete routes must not appear in static output.
- Redirects require a separate `redirects.json` entry and validator approval.
