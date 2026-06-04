# Secrets And Config Guardrails

No protected config was read or modified for this architecture lock.

Do not commit:

- JWTs
- Azure tokens
- Cloudflare tokens
- deployment tokens
- Cosmos keys
- storage keys
- connection strings
- SMTP credentials
- Microsoft 365 credentials
- provider credentials

Allowed in repo:

- placeholder references
- non-secret architecture decisions
- non-secret setup sequence
- validation checklists
- rollback planning

Placeholder references only:

- `PUMPKIN_COSMOS_ENDPOINT_REF`
- `PUMPKIN_COSMOS_DATABASE_REF`
- `PUMPKIN_COSMOS_CONTAINER_REF`
- `PUMPKIN_COSMOS_AUTH_MODE_REF`
- `PUMPKIN_COSMOS_KEY_REF` or managed identity equivalent
- `ICE_RINK_RENTALS_TENANT_ID`
- `ICE_RINK_RENTALS_SITE_KEY`

Future production configuration should use Azure app settings or Key Vault, with secrets never committed to the repo.
