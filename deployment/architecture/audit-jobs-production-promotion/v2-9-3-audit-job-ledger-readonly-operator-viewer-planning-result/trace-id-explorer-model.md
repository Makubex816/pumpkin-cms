# Trace ID Explorer Model

The trace explorer is derived from audit event `traceIds`.

## Fields

- `entries`: one row per trace field.
- `byField`: count by trace field.
- `correlationIds`: unique correlation IDs.
- `searchableFields`: sorted trace field names.

## Entry Fields

- `field`
- `value`
- `auditEventId`
- `eventType`
- `correlationId`
- `searchText`

## Combined Fixture

The combined fixture yields:

- 107 trace entries.
- 1 correlation ID.
- 19 searchable trace fields.

Trace search is local and in-memory through `searchTraceIds(viewerModel, query)`.
