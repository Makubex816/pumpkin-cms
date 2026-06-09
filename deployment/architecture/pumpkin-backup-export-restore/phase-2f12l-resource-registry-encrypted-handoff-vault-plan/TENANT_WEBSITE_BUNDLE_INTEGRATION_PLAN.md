# Tenant Website Bundle Integration Plan

Tenant website bundles should include tenant-scoped resource metadata similar in spirit to a safer `public_html` package.

## Tenant Bundle Resource Map

Each bundle should include:

- Tenant key
- Site key
- Domains
- Runtime profile
- Required resource IDs
- Required credential references by name only
- Backup artifact references
- Restore validation references
- Publication status

## Exclusions

Tenant bundles must not include:

- API keys
- Connection strings
- SAS values
- Tokens
- Cookies
- Private keys
- Protected config values
- Encrypted handoff vaults unless separately approved and stored outside normal bundle flow

## Restore Use

During restore planning, the tenant bundle resource map should tell the operator what resources must exist before restore execution can be approved.

