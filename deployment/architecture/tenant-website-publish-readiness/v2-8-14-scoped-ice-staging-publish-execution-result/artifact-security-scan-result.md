# Artifact Security Scan Result

Result: passed with one known non-blocking bundled-polyfill warning.

Checks:

- Forbidden artifact content path matches: `0`.
- High-confidence secret-like matches: `0`.
- `.env.local` references: `0`.
- `appsettings.Development` references: `0`.
- `local.settings` references: `0`.
- `content-review` references: `0`.
- `127.0.0.1` references: `0`.
- `localhost` references: `1`.

The single `localhost` match is inside the standard bundled Next/polyfill chunk and is not a Pumpkin config, endpoint, credential, or deployment value.

