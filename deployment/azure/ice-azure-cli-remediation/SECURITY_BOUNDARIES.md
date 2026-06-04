# Security Boundaries

Generated: 2026-06-04

## Planning-Only Boundary

This remediation package is local documentation only.

It does not authorize:

- software installation by Codex
- Azure login by Codex
- Azure resource discovery in this run
- Azure resource creation
- Blob container creation
- media upload
- Cloudflare/DNS changes
- CMS writes
- MediaAsset writes
- static deployment
- Microsoft 365/email actions
- protected config reads
- Roller work

## Protected Config Boundary

Do not read or modify:

- `.env.local`
- `appsettings.Development.json`
- protected config files

## Secret Output Boundary

Do not print:

- API keys
- secrets
- JWTs
- Azure tokens
- Cloudflare tokens
- deployment tokens
- Cosmos keys
- storage keys
- connection strings
- provider credentials
- SAS URLs

## Artifact Boundary

Do not stage:

- generated static artifacts
- raw images
- raw content-review input folders

## Read-Only Discovery Boundary

Future Azure discovery may print resource names, regions, and existence status only.

If a command would print credentials, tokens, keys, connection strings, or SAS URLs, do not run it.
