# Provider Metadata Endpoint Result

## Status

Implemented.

## Route

`GET /api/admin/provider-metadata?tenantKey=ice-rink-rentals&siteKey=ice-rink-rentals&environment=production`

## Authorization

The route requires JWT auth and permits:

- `SuperAdmin`;
- `TenantAdmin` for `ice-rink-rentals`;
- `Operator` for `ice-rink-rentals`.

## Response

The endpoint returns only:

- tenant/site/environment/profile identifiers;
- provider type/status;
- provisioning/runtime status;
- Cosmos account/resource group/subscription/database/container identifiers;
- backup policy mode;
- support flags;
- redaction status;
- `secretsIncluded: false`.

It does not return keys, connection strings, SAS values, tokens, auth headers, cookies, raw config, tenant payloads, or Cosmos documents.

