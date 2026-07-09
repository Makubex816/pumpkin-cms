# Shared Media Onboarding Standard V2.8.61OE

The tenant media standard is:

- use the shared production storage account unless the owner explicitly approves a new storage account;
- current shared production account: `iceskatingmedia`;
- create one tenant-scoped container per tenant using `<tenantId>-media`;
- use a tenant-scoped blob prefix `<tenantId>/` when preserving source-relative paths or avoiding filename collisions;
- do not place one tenant's assets in another tenant's container;
- do not use storage keys, listKeys, or SAS for onboarding media operations;
- complete blob readback before CMS MediaAsset import.

Party Pros conforms:

- account: `iceskatingmedia`;
- container: `party-pros-philadelphia-media`;
- prefix: `party-pros-philadelphia/`;
- blob readback: 627/627;
- MediaAsset readback: 627/627.

