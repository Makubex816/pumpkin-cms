# Shared Media Onboarding Standard

Current standard:

- All tenant media uses the shared production media storage account unless the owner explicitly approves a new storage account.
- Current shared production account: `iceskatingmedia`.
- Each tenant gets a tenant-scoped container named `<tenantId>-media`.
- Tenant blob paths may include tenant-scoped prefix `<tenantId>/` to preserve source-relative paths and avoid filename collisions.
- No tenant assets should be placed inside another tenant's container.
- No storage keys, listKeys, or SAS are used for onboarding media operations.
- Media blob readback must pass before CMS MediaAsset import.

Party Pros conformance:

| Rule | Party Pros value |
| --- | --- |
| Shared account | `iceskatingmedia` |
| Tenant container | `party-pros-philadelphia-media` |
| Tenant prefix | `party-pros-philadelphia/` |
| Blob readback | 627/627 |
| MediaAsset import | 627/627 after blob readback |

