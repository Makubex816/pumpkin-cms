# Next Phase Prompt

Approve V2.8.32W only: resolve the V2.8.32V `admin_login_failed_http_500_after_identity_repair` blocker after the `User` container and Admin identity repair succeeded.

Recommended scope:

- Do not deploy unless explicitly approved.
- Do not appsettings list/show.
- Use a new ignored secure handoff file only if protected values are needed.
- Bind source-discovered JWT support settings if approved:
  - `Jwt__Issuer`
  - `Jwt__Audience`
  - `Jwt__ExpirationMinutes`
- Do not print or write JWT secret, passwords, hashes, tokens, or cookies.
- Run live Admin login.
- Use returned bearer token only in memory.
- Run authenticated Admin FormEntry readback preflight.
- Only if readback preflight returns 2xx, run static contact preflights and exactly one production contact POST.
- Read back the resulting FormEntry by returned ID or trace.

Hard stops:

- No DNS/indexing.
- No inbox/provider login.
- No more than one production contact POST.
- No secret value disclosure.

