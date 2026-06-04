# Azure CLI Missing Blocker

Generated: 2026-06-04

## Blocker

The Ice production media Azure read-only discovery could not proceed because Azure CLI was not available in the terminal.

Prior blocker result:

```text
az: MISSING
```

## Impact

The following remain unknown:

- current Azure subscription context
- relevant resource groups
- existing storage accounts
- likely Ice/Pumpkin media storage candidates
- likely Azure Static Web App or static hosting candidates
- whether an existing media resource can be reused

## What This Package Does

This package documents how the user can make Azure CLI available and log in safely before a future read-only discovery run.

## What This Package Does Not Do

This package does not:

- install Azure CLI
- run `az login`
- select a subscription
- list Azure resources
- create Azure resources
- create Blob containers
- upload media
- change Cloudflare/DNS
- update CMS records
- update MediaAsset records
- deploy
- read protected config
- touch Roller

## Current Status

Azure read-only discovery readiness remains blocked by missing Azure CLI.
