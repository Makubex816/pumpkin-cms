# Filter Sort Search Model

V2.9.3 defines a local view-model foundation for future filtering, sorting, and searching.

## Filters

Future read-only viewers should support filtering by:

- Panel state.
- Event type.
- Event outcome.
- Job type.
- Job status.
- Gate type.
- Gate state.
- Evidence type.
- Trace field.
- Warning or blocker code.

## Sorting

Future viewers should sort by stable local fields:

- `occurredAt`
- `startedAt`
- `completedAt`
- `id`
- `type`
- `state`
- `outcome`

## Search

V2.9.3 implements trace search only. Future text search should stay local and derive from already-loaded ledger data until a separate Pumpkin API read-only boundary is approved.
