# Bulk Action Model

Bulk actions make outbound link governance useful but risky. Every bulk action must be preview-first.

## Supported Future Bulk Actions

- disable all links for selected domain;
- enable selected links;
- mark selected links pending review;
- archive stale links;
- set selected instances to plain text;
- hide selected instances;
- apply rel policy to selected links;
- export selected links for owner review.

## Workflow

1. Operator selects filters.
2. System creates preview with exact affected links and instances.
3. Operator supplies reason.
4. Permission check runs.
5. Validation confirms tenant/site scope and action compatibility.
6. Execution occurs only after explicit confirmation in a future approved implementation phase.
7. Audit records are written for the bulk action and affected entities.

## Safety Rules

- No bulk action may cross tenants by accident.
- Preview result count must match execution count or execution stops.
- Domain-level disable must show all affected pages and instances.
- Actions that affect rendering must require elevated permission.
- Bulk action exports must not include secrets or protected config.
