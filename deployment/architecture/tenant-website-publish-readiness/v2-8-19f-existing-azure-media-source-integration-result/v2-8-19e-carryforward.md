# V2.8.19E Carryforward

V2.8.19E established the existing Azure media target and found original media already present in Azure Blob Storage.

Carryforward values:

- Provider: Azure Blob Storage
- Storage account: `iceskatingmedia`
- Resource group: `rg-ice-production-media`
- Container: `ice-rink-rentals-media`
- Container public access: `blob`
- Public base URL: `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media`
- Existing media prefix: `ice-rink-rentals/assets/`
- Auth model carried forward: Azure identity / RBAC for read-only listing
- Upload allowed in V2.8.19F: no

V2.8.19F did not rerun Azure listing, did not upload, and did not mutate Azure. It reused the V2.8.19E package as the source of truth for existing blob names and sizes.
