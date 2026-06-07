# Profile: static-azure-cloudflare-worker-graph

This is the Ice-proven production profile.

## Components

- Pumpkin CMS
- static Next export
- Azure Static Web Apps
- Azure Blob media
- Cloudflare Worker media delivery
- Microsoft Graph form delivery
- Cloudflare DNS
- Search Console/indexing last

## Required Gates

- CMS-backed export validation
- strict static output validation
- strict staging package validation
- media upload/readiness validation
- Cloudflare Worker media delivery validation
- MediaAsset production URL validation
- form endpoint hardening
- Graph delivery proof and human inbox confirmation
- staging deployment and smoke
- production DNS/custom-domain cutover preflight
- production smoke
- operational readiness
- manual owner review
- final indexing approval

## Unsupported Without Separate Approval

- creating Azure resources
- changing Cloudflare DNS
- Function setting changes
- sending valid form tests
- deployment
- Search Console/indexing

