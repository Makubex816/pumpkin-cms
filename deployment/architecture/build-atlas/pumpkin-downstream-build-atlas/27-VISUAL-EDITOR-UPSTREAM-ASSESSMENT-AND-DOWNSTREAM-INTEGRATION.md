# Visual Editor Assessment and Downstream Integration

## Upstream capability

- combined page editor and interactive preview;
- block selection from preview;
- insert, move, duplicate, delete, and edit;
- desktop/tablet/mobile widths;
- page publication, routing, metadata, SEO, structured data, relationships;
- visual header/menu editing and nested items;
- logo media selection;
- unsaved-change warnings;
- authenticated preview;
- persistent block identity.

## Decision

Adopt/port rather than rebuild. Qualify it, migrate data, and add multi-tenant/control-plane safeguards.

## Downstream layers

### Tenant context
- server resolves tenant from deployment/session/authorized context;
- TenantAdmin cannot switch tenant through URL/body manipulation;
- SuperAdmin tenant switch is explicit, authorized, audited;
- page/theme/media/form calls validate ownership.

### Concurrency and audit
- ETag/version preconditions;
- conflict instead of silent overwrite;
- audit actor, tenant, entity, versions, correlation ID;
- authoritative readback before success.

### Preview security
- authenticated route;
- iframe sandbox/CSP compatibility review;
- UI and server-side no-write form mode;
- event capture treated as UX protection, not sole boundary;
- maintained sanitizer/trusted policy for rich HTML.

### Migration
- stable IDs for existing blocks;
- preserve custom/unknown content;
- all block types round-trip in .NET and TS;
- duplicate/reorder identity semantics;
- rollback for stored pages.

## Browser acceptance

```text
open existing page
select and edit every block
insert/move/duplicate/delete
save and reload
conflict on stale version
edit nested navigation and logo
desktop/tablet/mobile
preview cannot submit form
cross-tenant attempts fail
public cache/readback reflects save
```
