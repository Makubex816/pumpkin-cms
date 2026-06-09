# Security Boundaries

Allowed:

- Read committed fixtures and docs.
- Read approved process environment variables by name.
- Print env presence as `PRESENT` or `MISSING`.
- Write generated output under ignored `.tmp/`.
- Encrypt approved durable material before writing.

Not allowed:

- Print secret values.
- Read protected config.
- Write plaintext credential files.
- Include session JWTs in durable escrow.
- Run Azure commands.
- Call CMS/API endpoints.
- Deploy.
- Publish live pages.
- Run Search Console or indexing actions.
- Stage generated vault or handoff artifacts.

The implementation has no external HTTP call path.
