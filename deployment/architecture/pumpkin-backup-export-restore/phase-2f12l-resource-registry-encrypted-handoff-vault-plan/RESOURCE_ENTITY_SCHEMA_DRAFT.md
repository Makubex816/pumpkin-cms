# Resource Entity Schema Draft

Every resource entry should describe identity, ownership, environment, tenant mapping, credential references, and validation state without storing sensitive values.

## Required Fields

- `resourceId`: stable registry-local identifier
- `resourceType`: resource family
- `displayName`: human-readable name
- `environment`: local/dev/staging/production
- `status`: planned/provisioned/verified/attached/blocked/retired
- `tenantKeys`: tenant associations
- `siteKeys`: site associations
- `provider`: platform provider
- `nonSecretIdentifiers`: provider-specific identifiers
- `credentialRefs`: credential reference IDs
- `runtimeProfiles`: runtime profile IDs
- `owner`: owner or operator group
- `audit`: creation and verification metadata
- `rotation`: rotation expectations if credentials are associated
- `cleanup`: cleanup expectations when retired

## Non-Secret Identifier Examples

- Azure subscription display name or subscription ID
- Azure resource group name
- Cosmos account name
- Cosmos database name
- Cosmos container name
- Partition key path
- Cloudflare zone name
- Domain name
- CMS tenant key
- Runtime profile name

## Never Include

- API keys
- Account keys
- Connection strings
- SAS values
- Tokens
- Auth headers
- Cookies
- Private keys
- Protected config values

