# Approval Required

Generated: 2026-06-04

## Current Approval Status

This package is approval planning only.

Azure media resource creation readiness:

```text
pending explicit approval
```

## Required Approval Before Creation

The user must explicitly approve resource creation before any of these future commands are run:

- `az group create`
- `az storage account create`
- `az storage container create`

## Minimum Approval Text

Recommended exact approval wording:

```text
Approve creating the documented Azure media resource foundation for IceSkatingRinkRentals.com only: resource group rg-ice-production-media in eastus, storage account iceskatingmedia in eastus, and Blob container ice-rink-rentals-media with public access off. Do not upload media, change Cloudflare/DNS, update CMS or MediaAsset records, deploy, read protected config, print secrets, send email, touch Microsoft 365, or touch Roller.
```

## Not Approved By This Package

This package does not approve:

- Azure resource creation
- Cosmos resource creation
- Blob container creation
- media upload
- storage key listing
- connection string listing
- SAS URL generation
- access policy changes beyond the future documented private container creation
- Cloudflare/DNS changes
- CMS writes
- MediaAsset writes
- static export
- static deployment
- protected config reads
- email or Microsoft 365 work
- Roller work
- marking media production URL readiness `yes`

## Separate Future Approvals

After resource creation, separate approvals are still required for:

- media upload
- public media origin/access configuration
- Cloudflare media hostname setup
- MediaAsset production URL updates
- CMS writes, if any
- static export and validation
- deployment and DNS cutover
