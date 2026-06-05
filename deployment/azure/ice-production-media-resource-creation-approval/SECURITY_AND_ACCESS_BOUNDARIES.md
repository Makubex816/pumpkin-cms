# Security And Access Boundaries

Generated: 2026-06-04

## Planning Boundary

This package is documentation only.

No protected config was read. No credentials, keys, tokens, connection strings, SAS URLs, JWTs, or deployment secrets were printed.

## Credential Rules

Future execution must not print:

- Azure access tokens
- Azure storage account keys
- connection strings
- SAS URLs
- Cloudflare credentials
- API keys
- Admin JWTs
- provider credentials
- deployment credentials

If a future run checks credential presence, it should print only:

```text
PRESENT
```

or:

```text
MISSING
```

## Least-Privilege Direction

Future resource creation should use the least privilege needed for the approved step.

Preferred later patterns where possible:

- Azure CLI login with scoped role assignments
- managed identity for runtime access
- Key Vault or equivalent secret management for runtime-only values
- no credentials committed to git
- no secrets pasted into reports
- no long-lived keys used when a scoped identity can work

## Current Proposed Access

The planned storage account command keeps Blob public access disabled at the account level.

The planned container command creates the container with public access off.

This means the resource creation step alone will not make media publicly reachable. Public media delivery, origin access, CDN integration, or Cloudflare routing must be approved separately.

## Separate Approval Gates

Separate explicit approval is required before:

- creating Azure resources
- creating Blob containers
- changing storage public access settings
- changing container access policy
- uploading media
- setting blob cache headers
- creating or changing Cloudflare/DNS records
- updating CMS records
- updating MediaAsset records
- reading protected config
- using Admin JWTs or API keys
- deploying static output
- marking media production URL readiness `yes`

## Stop Conditions

Stop immediately if:

- a secret value would be printed
- a key or connection string is required
- a SAS URL would be generated
- protected config would need to be read
- Roller appears in scope
- a command would upload media
- a command would change DNS
- a command would write CMS or MediaAsset records
- a command would deploy or stage generated static output
