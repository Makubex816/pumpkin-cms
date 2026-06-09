# Preflight Scope

## Approved Checks

- Presence-only env/tooling checks.
- Azure CLI readiness check.
- Azure management-plane resource group, storage, and Cosmos account discovery.
- Cosmos platform backup evidence discovery only if a Cosmos account is visible without secrets.
- Media storage account/container/blob metadata discovery using `--auth-mode login`.
- Local fake connector regression checks.
- Go/no-go recommendation for later live connector execution.

## Not Approved

- Live Cosmos document export.
- Database export or import.
- Blob/media download.
- Storage key listing.
- Connection-string retrieval.
- SAS generation.
- Azure mutation.
- CMS writes or MediaAsset writes.
- POST/PUT/PATCH/DELETE CMS/API requests.
- Protected config reads.
- Secret export.
- Encrypted escrow payload creation beyond existing fake tests.
- Deployment, DNS, Cloudflare, email, Search Console/indexing, or live-page publication.
