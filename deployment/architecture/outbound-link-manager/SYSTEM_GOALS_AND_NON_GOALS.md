# System Goals And Non-Goals

## Goals

- Treat outbound links as first-class tenant-scoped CMS entities.
- Track every known placement of every outbound URL.
- Support global link status and per-instance status.
- Give operators safe search, filtering, review, and bulk-action workflows.
- Preserve tenant isolation across Admin, API, scans, backups, restores, and bundles.
- Make rendering control deterministic for dynamic and static output.
- Integrate outbound links into Backup Center and tenant website bundles.
- Support local/offline scans of fixture content, import packages, backups, and tenant bundles.
- Allow future live-readonly discovery only under explicit approval.
- Record audit history for human and system actions.

## Non-Goals

- No implementation in Phase 2H-1.
- No database migration.
- No CMS writes.
- No Admin UI, Pumpkin API, or Electron implementation.
- No external link crawling.
- No live HTTP health checks for outbound URLs.
- No protected config reads.
- No Azure, Cloudflare, DNS, CMS/API, deployment, indexing, or publication mutations.
- No automatic SEO endorsement of outbound links.
- No guarantee that an external URL is safe, available, or legally approved.

## Design Constraints

- Every record must carry tenant and site scope.
- Bulk operations must preview impact before writes.
- Scanner output must be deterministic and replayable.
- Disabled rendering must be compatible with static export.
- Standard backups must be able to capture outbound link state without secrets.
- Restore validation must be able to compare counts and policy state.
