# Pumpkin Tenant Redirect Import Validation Standard V2.8.62DRT

## Required Disposition

Every source-package redirect declaration receives one semantic disposition before live import:

- existing idempotent redirect;
- client anchor, not a server record;
- persistable TenantRedirect action;
- blocked invalid source/target;
- blocked self-route;
- blocked cycle;
- blocked duplicate source;
- blocked existing conflict;
- blocked unresolved target;
- blocked unsupported status or scheme.

No declaration may disappear from accounting.

## Plan Contract

A persistable plan contains:

- schema version and normalized tenant ID;
- declaration, existing no-op, create, blocked, and projected persisted counts;
- complete cycle output;
- every source declaration with source file/evidence and normalized values;
- deterministic create actions with idempotency key, exact Admin endpoint, and payload;
- status `persistable_idempotent_plan` only when blocked count and cycle count are zero.

Resume compares each source with live existing records. Exact semantic matches become no-op actions. Conflicts block before write.

## Fail-Closed Validation

Before a page import may rely on the plan, validate:

- schema, tenant, plan status, blocked count, and cycle count;
- action count and exact tenant endpoint;
- action type and non-empty idempotency key;
- source/target distinction and target kind;
- active/query/target status/page-shadow fields;
- one of `301/302/307/308`;
- source package path, source declaration, and audit correlation;
- HTTP(S)-only external targets with no embedded credentials.

Without a valid matching plan, a meaningful redirect unsupported by the page-owned model remains an import error.

## Write Boundary

Planning and validation never create records. A later import phase must revalidate against fresh live pages and redirects immediately before each approved write and must read back deterministic IDs after apply.
