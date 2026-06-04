# Ice Production Architecture Lock

Generated: 2026-06-04

Site: IceSkatingRinkRentals.com

This package locks the planned production architecture for the approved Ice live CMS pages.

Architecture:

- Public website/static frontend: Azure Static Web App
- CMS production data: Azure Cosmos DB
- Production media/image binaries: Azure Blob Storage
- DNS/CDN/cache: Cloudflare
- Mailbox provider: Microsoft 365 Exchange Online Plan 1
- CMS editing: Pumpkin CMS remains editable after launch
- Publishing: manual and approval-gated

This is documentation and planning only. No Azure resources, Cosmos resources, Blob containers, Cloudflare DNS records, CMS records, MediaAsset records, static packages, deployments, Microsoft 365 settings, email sending, protected config, or Roller changes were performed.

Readiness context:

- Live CMS visual approval for `/`, `/contact`, and `/service-areas`: complete
- Static generation: not run
- Azure staging: not created
- Production DNS/indexing: not ready
- RollerRinkRentals.com: paused
