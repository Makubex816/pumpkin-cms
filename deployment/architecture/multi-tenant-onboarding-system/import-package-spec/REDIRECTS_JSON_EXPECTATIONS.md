# Redirects JSON Expectations

`redirects.json` defines approved redirects.

Required per redirect:

- `source`
- `destination`
- `statusCode`
- `reason`

Rules:

- Redirects must not point to draft, preview, unrelated tenant, localhost, or secret-bearing URLs.
- Redirects are not a substitute for route allowlist validation.
- Redirects should be smoke-tested after staging and production cutover.

