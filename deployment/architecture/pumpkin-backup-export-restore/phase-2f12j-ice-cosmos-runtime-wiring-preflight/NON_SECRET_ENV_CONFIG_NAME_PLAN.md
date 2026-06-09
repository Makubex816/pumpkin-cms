# Non-Secret Environment and Configuration Name Plan

This file lists names only. It does not define values and does not require protected config reads.

## Runtime Profile Names

- `PUMPKIN_RUNTIME_PROFILE`
- `PUMPKIN_PROVIDER_PROFILE`
- `PUMPKIN_PROVIDER_METADATA_MODE`
- `PUMPKIN_PROVIDER_METADATA_ENDPOINT_ENABLED`
- `PUMPKIN_PROVIDER_METADATA_ENDPOINT_PATH`
- `PUMPKIN_PROVIDER_METADATA_ENVIRONMENT`
- `PUMPKIN_PROVIDER_METADATA_ALLOWED_TENANTS`
- `PUMPKIN_PROVIDER_METADATA_REQUIRED_ROLE`

## Local Development Names

- `PUMPKIN_LOCAL_PROVIDER_FIXTURE`
- `PUMPKIN_FAKE_PROVIDER_ENABLED`
- `PUMPKIN_BACKUP_CENTER_FIXTURE_ROOT`
- `PUMPKIN_PROVIDER_RESOLVER_MODE`

## Cosmos Non-Secret Identifier Names

- `PUMPKIN_COSMOS_SUBSCRIPTION_HINT`
- `PUMPKIN_COSMOS_RESOURCE_GROUP`
- `PUMPKIN_COSMOS_ACCOUNT_NAME`
- `PUMPKIN_COSMOS_DATABASE_NAME`
- `PUMPKIN_COSMOS_CONTAINER_NAMES`
- `PUMPKIN_COSMOS_PARTITION_KEY_PATH`
- `PUMPKIN_COSMOS_BACKUP_POLICY_MODE`
- `PUMPKIN_COSMOS_PUBLIC_NETWORK_ACCESS_STATUS`

## Identity and Access Names

- `PUMPKIN_RUNTIME_IDENTITY_NAME`
- `PUMPKIN_BACKUP_READ_IDENTITY_NAME`
- `PUMPKIN_RUNTIME_RBAC_MODE`
- `PUMPKIN_BACKUP_RBAC_MODE`

## Names Intentionally Not Introduced

No connection-string, account-key, SAS, or token environment variable names are introduced by this preflight. Managed identity and role-based access remain the preferred future direction. Any future secret-bearing configuration requires a separate protected-config and escrow approval boundary.

