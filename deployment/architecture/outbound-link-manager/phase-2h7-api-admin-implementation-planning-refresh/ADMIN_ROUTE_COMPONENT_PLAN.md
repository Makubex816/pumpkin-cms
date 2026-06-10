# Admin Route Component Plan

Admin should extend the current dashboard route pattern under `apps/admin/src/app/dashboard/`.

Planned routes:

| Route | Screen |
| --- | --- |
| `/dashboard/outbound-links` | Dashboard/list |
| `/dashboard/outbound-links/[id]` | Link detail |
| `/dashboard/outbound-links/[id]/instances` | Link-specific usage |
| `/dashboard/outbound-links/instances` | Tenant/site-wide instances |
| `/dashboard/outbound-links/domains` | Domain management |
| `/dashboard/outbound-links/bulk-actions` | Bulk action preview and execution workflow |
| `/dashboard/outbound-links/scan-runs` | Scan run history |
| `/dashboard/outbound-links/audit` | Audit log |
| `/dashboard/outbound-links/policies` | Tenant policy settings |
| `/dashboard/outbound-links/review` | Review required queue |
| `/dashboard/outbound-links/exports` | Backup/onboarding/tenant bundle status |

Planned components:

- `OutboundLinksTable`
- `OutboundLinkFilters`
- `OutboundLinkStatusBadge`
- `OutboundLinkDetailPanel`
- `OutboundLinkInstancesTable`
- `OutboundLinkDomainPolicyTable`
- `OutboundLinkBulkActionPreview`
- `OutboundLinkScanRunsTable`
- `OutboundLinkAuditTimeline`
- `OutboundLinkPolicyForm`
- `OutboundLinkReadOnlyBanner`
- `OutboundLinkBackupStatusPanel`

Planned client extension:

- Add typed methods to the existing Admin API client after Phase 2H-8 defines shared contracts.
- Keep authenticated requests consistent with current Admin patterns.
- Avoid logging request payloads that can contain protected operational context.

No files are created or changed in `apps/admin/` during Phase 2H-7.

