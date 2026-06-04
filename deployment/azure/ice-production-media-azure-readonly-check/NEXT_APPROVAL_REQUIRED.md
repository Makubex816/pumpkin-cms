# Next Approval Required

Generated: 2026-06-04

## Current Approval Used

Approval used in this run:

```text
Azure read-only checks only for Ice production media.
```

## Blocked Next Step

Azure read-only discovery could not proceed because Azure CLI is unavailable.

## Required Next User Action

Use a terminal where Azure CLI is installed and already logged in, then approve rerunning Azure read-only discovery.

Recommended approval wording:

```text
Approve Azure read-only discovery only for Ice production media in a terminal where az is available and already logged in. Do not create resources, create Blob containers, upload media, change DNS, update CMS or MediaAsset records, deploy, print secrets, or touch Roller.
```

## Not Approved

This run does not approve:

- Azure resource creation
- Cosmos resource creation
- Blob container creation
- media upload
- Cloudflare/DNS changes
- CMS writes
- MediaAsset writes
- static deployment
- protected config reads
- email or Microsoft 365 actions
- Roller work
- marking media production URL readiness `yes`
