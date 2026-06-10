# Admin UI Implementation Plan

No Admin UI implementation is approved in Phase 2H-2.

## Future Routes

```text
apps/admin/src/app/dashboard/outbound-links/page.tsx
apps/admin/src/app/dashboard/outbound-links/[id]/page.tsx
apps/admin/src/app/dashboard/outbound-links/scan-runs/page.tsx
apps/admin/src/app/dashboard/outbound-links/policies/page.tsx
```

## Future Components

```text
apps/admin/src/components/outbound-links/OutboundLinksTable.tsx
apps/admin/src/components/outbound-links/OutboundLinkFilters.tsx
apps/admin/src/components/outbound-links/OutboundLinkInstances.tsx
apps/admin/src/components/outbound-links/OutboundLinkAuditTimeline.tsx
apps/admin/src/components/outbound-links/BulkActionPreview.tsx
apps/admin/src/components/outbound-links/DomainPolicyEditor.tsx
```

## UI Gates

- Admin read-only screens can come before write actions.
- Bulk action execution cannot ship before preview, permissions, and audit logs.
- Policy editor cannot ship before restore/backout plan.
- Tenant selector must scope every request.
