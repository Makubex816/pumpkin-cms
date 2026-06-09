# Provider Metadata Endpoint

## Route

`GET /api/admin/provider-metadata`

Allowed query parameters:

- `tenantKey`
- `siteKey`
- `environment`

## Implemented Scope

The Pumpkin API now includes a GET-only provider metadata route for the approved Ice/Pumpkin Cosmos target.

The route returns non-secret metadata only and is intentionally limited to the provisioned future-target Ice profile.

## Authorization

The endpoint requires JWT authentication and one of:

- `SuperAdmin`;
- `TenantAdmin` for the requested tenant;
- `Operator` for the requested tenant, reserved for future operator role wiring.

The route does not use tenant API keys and does not accept public access.

## Response Contract

The response is allowlisted to:

- `tenantKey`
- `siteKey`
- `environment`
- `profile`
- `providerType`
- `providerStatus`
- `provisioningStatus`
- `runtimeStatus`
- `accountName`
- `resourceGroup`
- `subscriptionHint`
- `databaseName`
- `containerNames`
- `backupPolicyMode`
- `portableExportSupported`
- `platformBackupEvidenceSupported`
- `redactionStatus`
- `secretsIncluded`

## Boundary

The endpoint does not read protected config, list keys, return connection strings, generate SAS, read Cosmos documents, export data, write CMS records, switch runtime providers, or mutate Azure.

