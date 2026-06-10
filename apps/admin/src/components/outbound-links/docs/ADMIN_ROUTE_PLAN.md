# Admin Route Plan

The Admin route foundation follows the existing dashboard route pattern under `apps/admin/src/app/dashboard`.

| Route | Purpose |
| --- | --- |
| `/dashboard/outbound-links` | Dashboard, metrics, filters, pagination, link list, and backup/bundle status |
| `/dashboard/outbound-links/[id]` | Read-only registry detail, active policy, and placement summary |
| `/dashboard/outbound-links/[id]/instances` | Read-only usage table for one link |
| `/dashboard/outbound-links/instances` | Tenant-wide outbound link placements |
| `/dashboard/outbound-links/policies` | Read-only policy and domain lists |
| `/dashboard/outbound-links/scan-runs` | Read-only scan-run history |
| `/dashboard/outbound-links/audit` | Read-only audit timeline |
| `/dashboard/outbound-links/review` | Pending-review and blocked-domain queue |
| `/dashboard/outbound-links/exports` | Backup Center, onboarding, and tenant-bundle status |

The dashboard navigation includes one `Outbound Links` entry.

