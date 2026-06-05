# Remaining Media Delivery Blockers

## Blockers

- container blob-level anonymous read is not enabled
- direct Azure Blob public URLs return `404`
- Cloudflare/DNS media delivery is not configured
- Cloudflare path rewrite is not configured
- MediaAsset production URL updates are not done
- strict validators have not been rerun against production media domain URLs
- contact form production readiness remains `no`
- Azure staging readiness remains `no`
- DNS cutover readiness remains `no`
- production/indexing readiness remains not live-ready

## Immediate Technical Blocker

The approved `az storage container set-permission` path cannot be completed without key auth in this Azure CLI environment, and key-based auth was forbidden.

## Required Next Decision

Choose an approved way to set blob-level anonymous read on `ice-rink-rentals-media` without printing or exposing secrets, or explicitly approve a different access method.

