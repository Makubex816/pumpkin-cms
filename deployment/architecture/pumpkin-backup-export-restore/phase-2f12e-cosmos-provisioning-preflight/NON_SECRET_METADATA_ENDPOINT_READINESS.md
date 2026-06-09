# Non-Secret Provider Metadata Endpoint Readiness

## Current Status

Phase 2F-12D deferred endpoint implementation and implemented the local response contract instead.

## Endpoint Readiness Requirements

Before implementing the endpoint:

- route must be GET-only;
- auth must require admin/operator permission;
- response must use the Phase 2F-12D non-secret contract;
- runtime metadata provider must avoid protected config reads;
- response must never include keys, connection strings, tokens, SAS URLs, auth headers, cookies, raw app settings, tenant API-key material, or protected config values;
- tests must cover forbidden fields;
- audit event model must be defined.

## Proposed Route

`GET /api/admin/provider-metadata?tenantKey={tenantKey}&siteKey={siteKey}`

## Expected Missing-Source Response

```json
{
  "contractVersion": "0.1.0",
  "tenantKey": "ice-rink-rentals",
  "siteKey": "ice-rink-rentals",
  "environment": "production",
  "profile": "production-readonly",
  "providerType": "missing",
  "providerStatus": "missing",
  "sourceResolutionStatus": "unresolved",
  "selectedTargetProvider": "cosmos",
  "liveConnectorExecutionAllowed": false,
  "redactionStatus": "passed",
  "secretsIncluded": false
}
```

## Readiness Classification

Ready for endpoint implementation approval: yes, after owner accepts the endpoint contract and permission model.

Ready for live endpoint execution: no.
