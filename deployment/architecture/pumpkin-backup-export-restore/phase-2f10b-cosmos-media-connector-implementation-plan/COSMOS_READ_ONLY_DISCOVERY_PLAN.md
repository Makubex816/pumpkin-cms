# Cosmos Read-Only Discovery Plan

## Purpose

The future read-only discovery connector should identify the Cosmos account, database, containers, partition-key metadata, and tenant scoping needed for a production-safe backup. It must not export documents during discovery.

## Proposed Modules

- `src/connectors/cosmos/cosmos-profile.mjs`
- `src/connectors/cosmos/cosmos-readonly-discovery.mjs`
- `src/connectors/cosmos/cosmos-discovery-report-writer.mjs`
- `src/connectors/cosmos/cosmos-source-contract.mjs`

## Discovery Inputs

Presence-only environment checks should cover:

- `PUMPKIN_DATABASE_PROVIDER`
- `PUMPKIN_COSMOS_ACCOUNT_NAME`
- `PUMPKIN_COSMOS_RESOURCE_GROUP`
- `PUMPKIN_COSMOS_DATABASE_NAME`
- `PUMPKIN_COSMOS_CONTAINER_PREFIX`
- `PUMPKIN_COSMOS_AUTH_MODE`
- `PUMPKIN_TENANT_ID`
- `PUMPKIN_TENANT_SLUG`
- `PUMPKIN_SITE_ID`
- `PUMPKIN_SITE_SLUG`
- `AZURE_SUBSCRIPTION_ID`

Values must not be printed. Reports should include only approved non-secret identifiers after redaction review.

## Discovery Outputs

The connector should write a discovery report under ignored `.tmp` output during execution phases:

```json
{
  "provider": "cosmos",
  "account": "redacted-or-non-secret-name",
  "database": "redacted-or-non-secret-name",
  "containers": [
    {
      "name": "container-name",
      "partitionKeyPath": "/tenantId",
      "indexingMode": "consistent",
      "estimatedItemCount": null,
      "tenantScopedQueryAvailable": true
    }
  ],
  "tenantScope": {
    "tenantIdPresent": true,
    "siteIdPresent": true
  },
  "safeToExport": false
}
```

## Discovery Methods

- Fixture mode reads fake container metadata from test fixtures.
- Local-dev mode reads from a deliberately safe local fixture or emulator profile.
- Azure read-only mode uses approved read-only Azure/Cosmos APIs or CLI commands.
- API-provider mode may use an application-level read-only endpoint only if a later approval explicitly allows it.

## Hard Stops

Discovery must abort if:

- Required env presence checks are missing.
- Provider is not explicitly resolved.
- Tenant scope is missing.
- The command would need a credential file read.
- The command would print or persist secrets.
- A write-capable operation is requested.
