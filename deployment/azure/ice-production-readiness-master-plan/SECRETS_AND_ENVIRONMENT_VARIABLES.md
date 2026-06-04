# Secrets And Environment Variables

Generated: 2026-06-04

## Policy

Placeholders only. Do not include secret values.

Secrets must remain out of:

- git
- chat
- reports
- handoff archives
- static frontend bundles

Do not read protected config to fill this plan.

## Placeholder Categories

Pumpkin/API:

- `PUMPKIN_API_URL` placeholder
- `ICE_RINK_RENTALS_TENANT_ID` placeholder
- `ICE_RINK_RENTALS_API_KEY` placeholder
- `PUMPKIN_ADMIN_JWT` placeholder

Static form:

- `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` placeholder
- `STATIC_FORM_ENDPOINT` placeholder
- `NEXT_PUBLIC_STATIC_FORM_ACTION` placeholder
- `STATIC_FORM_ACTION` placeholder
- `STATIC_FORM_ENDPOINT_VERIFIED` placeholder

Azure storage:

- Azure storage account placeholder
- Azure Blob container placeholder
- Azure storage credential placeholder
- Azure managed identity placeholder

Cloudflare:

- Cloudflare zone placeholder
- Cloudflare API token placeholder
- DNS record target placeholder

Microsoft 365/email:

- mailbox identity placeholder
- SMTP/provider credential placeholder
- email recipient reference placeholder

Deployment:

- Azure Static Web App deployment token placeholder
- Azure resource group placeholder
- Azure subscription placeholder

## Frontend Secret Boundary

The static frontend may receive a public endpoint URL only.

Never expose tenant API keys, Pumpkin admin JWTs, Azure tokens, storage keys, Cloudflare tokens, SMTP credentials, Microsoft 365 credentials, or connection strings in browser code.

## Current Run Result

No secret values were read, printed, or written.

