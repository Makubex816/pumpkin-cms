# Next Phase Prompt

Approve V2.8.32U only: resolve the V2.8.32T `admin_login_unauthorized_after_provider_binding` blocker after provider binding was proven active and health was diagnosed as a hardcoded false readiness signal.

Recommended scope:

- Use a new ignored secure handoff file only if protected Admin auth data repair is approved.
- Do not print or write passwords, hashes, connection strings, JWT secrets, tokens, or cookies.
- Do not list/show appsettings with raw values.
- Choose one approved repair path:
  - provide corrected Admin credentials that return 2xx from `POST /api/auth/login`, or
  - approve a source-discovered, directly scoped Admin user seed/repair implementation and deployment.
- If Admin login succeeds, use the bearer token only in memory.
- Run authenticated Admin FormEntry readback preflight.
- Only if readback preflight returns 2xx, run static contact preflights.
- Submit exactly one synthetic non-PII production contact POST.
- Read back the returned entry ID or trace through authenticated Admin FormEntry route.

Hard stops:

- No DNS/indexing.
- No inbox/provider login.
- No more than one production contact POST.
- No secret value disclosure.

