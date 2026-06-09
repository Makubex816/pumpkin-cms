# Credential Reference Result

Credential reference tooling writes `REQUIRED_SECRET_REFERENCES.json` with:

- credential reference identity
- env var name when applicable
- purpose
- required-for and resource relationships
- storage location category
- escrow eligibility and status
- rotation and cleanup requirements
- presence metadata only

Rules enforced:

- `PUMPKIN_ADMIN_JWT` is marked present/excluded when present and is not durable escrow.
- `ROLLER_RINK_RENTALS_API_KEY` is durable API key material and encrypted-vault eligible when present.
- Credential references cannot include plaintext value fields.

No credential values are written to committed files.
