# Encrypted Handoff Vault

The vault is a local-only encrypted folder under `.tmp/`.

Files:

- `vault-manifest.json`
- `encrypted-payload.bin`
- `approval-record.json`
- `recipient-metadata.json`
- `CHECKSUMS.sha256`
- `VAULT_VALIDATION_RESULT.md`
- `vault-validation-result.json`

Encryption:

- Node built-in `crypto`
- AES-256-GCM authenticated encryption
- `scrypt` key derivation from `PUMPKIN_HANDOFF_VAULT_PASSPHRASE`
- random salt
- random IV
- auth tag stored in manifest
- ciphertext and plaintext checksum metadata stored in manifest

The passphrase is never stored. The decrypted payload is never printed.

Session vault payload rules:

- Include durable allowlisted material from `ROLLER_RINK_RENTALS_API_KEY` only when present.
- Exclude `PUMPKIN_ADMIN_JWT` from durable escrow by default.
- Never read protected config files.
- Never write plaintext credential files.
