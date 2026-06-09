# Session Vault Bootstrap

Approved env names:

- `PUMPKIN_API_URL`
- `PUMPKIN_ADMIN_JWT`
- `ROLLER_RINK_RENTALS_API_KEY`
- `ROLLER_RINK_RENTALS_TENANT_ID`
- `PUMPKIN_HANDOFF_VAULT_PASSPHRASE`

Minimum required to create the encrypted session vault:

- `ROLLER_RINK_RENTALS_API_KEY`: present
- `PUMPKIN_HANDOFF_VAULT_PASSPHRASE`: present

If either required value is missing, `create-session-vault` writes:

- `session-vault-blocker.json`
- `SESSION_VAULT_BLOCKED.md`

No encrypted payload is created in the blocked case.

When the vault is created, only the durable API key is encrypted. The admin JWT is recorded as present/excluded and is not placed into durable escrow.
