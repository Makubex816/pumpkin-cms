# Credential References

Credential references are committable pointers. They do not contain values.

The writer creates `REQUIRED_SECRET_REFERENCES.json` with:

- reference ID
- env var name when applicable
- purpose
- required-for relationships
- resource and tenant scope
- storage category
- escrow eligibility
- escrow status
- rotation and cleanup expectations
- presence only, never values

Defaults enforced by the implementation:

- `PUMPKIN_ADMIN_JWT`: session token, present/excluded when present, non-durable escrow
- `ROLLER_RINK_RENTALS_API_KEY`: durable API key, encrypted-vault eligible when present
- `PUMPKIN_HANDOFF_VAULT_PASSPHRASE`: passphrase presence only, never stored

The validator rejects `value`, `plaintextValue`, `credentialValue`, and secret-like fields in credential reference documents.
