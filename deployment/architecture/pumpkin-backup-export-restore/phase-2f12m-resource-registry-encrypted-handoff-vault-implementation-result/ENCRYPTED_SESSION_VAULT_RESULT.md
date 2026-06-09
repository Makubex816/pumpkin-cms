# Encrypted Session Vault Result

Environment presence gate:

| Variable | Result |
| --- | --- |
| `PUMPKIN_API_URL` | PRESENT |
| `PUMPKIN_ADMIN_JWT` | PRESENT |
| `ROLLER_RINK_RENTALS_API_KEY` | PRESENT |
| `ROLLER_RINK_RENTALS_TENANT_ID` | PRESENT |
| `PUMPKIN_HANDOFF_VAULT_PASSPHRASE` | PRESENT |

Bootstrap result:

- `.tmp/session-handoff-vault`: created
- vault validation: passed
- encrypted durable item count: 1
- excluded item count: 1
- session JWT durable escrow: false

Encryption:

- AES-256-GCM
- Node built-in crypto
- scrypt KDF
- random salt and IV
- auth tag and checksum metadata in manifest

No passphrase, decrypted payload, plaintext credential file, or protected config value was written.
