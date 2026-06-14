# Redaction No-Secret Contract Result

Status: implemented.

The shared viewer contract includes `redactionPolicy`:

- raw secrets allowed: false;
- raw PII allowed: false;
- protected config allowed: false;
- token-like values allowed: false;
- disallowed secret classes include OAuth tokens, deployment tokens, storage keys, connection strings, SAS URLs, cookies, auth headers, and private keys.

The validator rejects secret-like field names and high-confidence secret-like values. The invalid token-like test uses a placeholder field name and does not store token material.

No protected config was read.
