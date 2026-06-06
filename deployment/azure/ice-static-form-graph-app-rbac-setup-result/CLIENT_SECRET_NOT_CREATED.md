# Client Secret Not Created

Generated: 2026-06-05
Updated: 2026-06-06

No client secret or certificate was created in this pass.

Verified app credential counts:

```text
passwordCredentialCount=0
keyCredentialCount=0
```

No Graph client secret, certificate, or email credential was created or written to files.

Future app credential setup requires separate approval and should prefer:

- managed identity if feasible, or
- certificate/Key Vault reference, or
- client secret stored only as an approved server-side secret/Key Vault reference

Do not put Graph credentials in static frontend output.
