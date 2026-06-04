# Cosmos DB Production Data Plan

Azure Cosmos DB stores Pumpkin CMS production data.

Cosmos stores:

- tenants
- sites
- pages
- drafts
- live/published records
- revisions
- rollback metadata
- themes/navigation
- MediaAsset metadata
- form definitions
- form entries/leads
- publish manifests
- workflow/approval state
- audit/import/export records if supported

Cosmos does not store:

- image binaries
- generated static files
- deployment artifacts
- secrets
- API keys
- SMTP credentials
- Cloudflare tokens
- Microsoft 365 credentials
- Azure storage keys

Placeholder references only:

- `PUMPKIN_COSMOS_ENDPOINT_REF`
- `PUMPKIN_COSMOS_DATABASE_REF`
- `PUMPKIN_COSMOS_CONTAINER_REF`
- `PUMPKIN_COSMOS_AUTH_MODE_REF`
- `PUMPKIN_COSMOS_KEY_REF` or managed identity equivalent
- `ICE_RINK_RENTALS_TENANT_ID`
- `ICE_RINK_RENTALS_SITE_KEY`

No real endpoint, database, container, auth, key, connection string, or credential value is stored in this package.

Provisioning status: planned, not provisioned.
