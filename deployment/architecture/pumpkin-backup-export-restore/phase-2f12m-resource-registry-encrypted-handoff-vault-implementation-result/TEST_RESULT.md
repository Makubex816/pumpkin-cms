# Test Result

Package tests:

- command: `npm test`
- result: passed
- tests: 13

Package check:

- command: `npm run check`
- result: passed

Covered behavior:

- redacted registry generation
- credential references without values
- fake vault encryption
- blocked session vault when passphrase is missing
- session vault creation when passphrase and durable API key are present
- encrypted payload is not plaintext JSON
- handoff package generation
- checksum validation
- registry secret-like rejection
- credential value-field rejection
- `.tmp` path guard rejection
- source external-call/protected-config scan
- package `.gitignore` coverage
