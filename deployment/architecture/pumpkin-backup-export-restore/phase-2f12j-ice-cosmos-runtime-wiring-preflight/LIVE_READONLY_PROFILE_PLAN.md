# Live Read-Only Profile Plan

## Purpose

The `live-readonly` profile verifies that deployed or local API surfaces can return non-secret Ice provider metadata without changing CMS runtime behavior.

## Allowed Future Checks

Only after a later explicit read-only approval, the operator may:

- Confirm the provider metadata endpoint is reachable.
- Confirm the endpoint requires authorization.
- Confirm the endpoint returns only non-secret metadata.
- Confirm Ice maps to the provisioned future Cosmos target.
- Confirm runtime switch, data seed, and live export flags remain false.

## Disallowed Checks

- No CMS writes
- No data migration
- No database export
- No Cosmos document export
- No blob/media download
- No keys, connection strings, SAS, listKeys, or protected config reads
- No Azure mutation

## Readback Expectations

The read-only profile should produce a redacted report containing:

- HTTP method used
- Endpoint path
- Tenant and site keys
- Provider classification
- Runtime status
- Redaction result
- Decision result

