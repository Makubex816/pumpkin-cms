# Permission Audit Bulk Action Plan

## Permissions

First local implementation should encode roles as fixture metadata only.

Future runtime roles:

- SuperAdmin;
- TenantAdmin;
- Operator;
- ContentEditor;
- Viewer;
- SystemScanner;
- BackupOperator.

## Audit

Local scanner may produce audit-like summaries, but immutable runtime audit logging starts only when write endpoints exist.

Future audit service records:

- action;
- actor;
- tenant/site;
- link id;
- instance id;
- previous value;
- new value;
- reason;
- timestamp.

## Bulk Actions

Phase 2H-3 may model preview output only:

- affected links;
- affected instances;
- pages affected;
- required permission;
- reason required;
- execution not supported.

Execution remains future-gated.
