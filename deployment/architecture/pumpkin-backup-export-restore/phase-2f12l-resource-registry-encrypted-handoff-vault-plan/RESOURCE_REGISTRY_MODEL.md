# Resource Registry Model

The Resource Registry is a redacted, committable inventory of platform resources and wiring.

## Registry Responsibilities

- Track non-secret resource identity.
- Map resources to tenants, sites, domains, bundles, and runtime profiles.
- Record lifecycle status and validation state.
- Reference credentials by name and purpose only.
- Track rotation, cleanup, and ownership expectations.
- Support Backup Center, Admin/API, Electron, and tenant bundle workflows.

## Resource Types

Supported resource families:

- Azure subscription
- Azure resource group
- Cosmos account
- Cosmos database
- Cosmos container
- Media storage account
- Media storage container
- Static web app
- Function app
- Cloudflare zone
- Cloudflare DNS record
- Cloudflare worker
- Domain
- Media domain
- CMS tenant
- CMS site
- API runtime profile
- Admin app profile
- Tenant website bundle
- Backup artifact reference
- Restore validation reference
- Credential reference

## Status Values

- `planned`
- `provisioned`
- `verified`
- `attached`
- `blocked`
- `retired`

## Environment Values

- `local`
- `dev`
- `staging`
- `production`

## Registry Storage

Committable registry files should live under a future registry package path such as:

`deployment/architecture/pumpkin-resource-registry/`

Generated downloadable registry packages should be written only under ignored `.tmp` output or outside the repo.

## Ice Initial Classification

IceSkatingRinkRentals.com currently has a provisioned future Cosmos target. It is not runtime-switched and is not ready for live database export.

