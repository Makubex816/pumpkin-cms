# Validator

Validators cover:

- registry JSON parse and contract
- credential reference JSON parse and contract
- no public plaintext credential values
- no secret-like public text
- output path containment under `.tmp/`
- vault manifest and encryption metadata
- encrypted payload is not plaintext JSON
- vault decryptability when the passphrase is available
- handoff package required files
- SHA-256 checksums

Generated validation reports are written under the same `.tmp/` output folder.

The source test suite also scans package source for protected-config read patterns and external HTTP call patterns.
