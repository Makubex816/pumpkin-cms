# Domain Model

## Core Entities

`OutboundLink` is the canonical registry entry for one normalized outbound URL within a tenant/site.

`OutboundLinkInstance` is one placement of that outbound link in content, navigation, footer, theme settings, forms, or imported package data.

`OutboundLinkPolicy` defines tenant/site defaults for disabled links, rel attributes, external target behavior, allow/block domain lists, and review requirements.

`OutboundLinkScanRun` records one discovery pass over local or approved live-readonly sources.

`OutboundLinkAuditLog` records changes to links, instances, policies, and bulk actions.

## Identity And Scope

Logical entity fields follow the approved spec names:

- `tenant_id`
- `site_id`

Pumpkin runtime implementations may expose aliases such as `tenantKey` and `siteKey`, but the architectural contract requires tenant and site scope on every record.

## Status Model

Link statuses:

- `active`
- `disabled`
- `pending_review`
- `domain_blocked`
- `stale`
- `broken_unverified`
- `archived`

Instance statuses:

- `enabled`
- `disabled`
- `hidden`
- `plain_text`
- `fallback`
- `pending_review`
- `stale`

`broken_unverified` means the system has received a non-crawling signal that a link may be broken, such as an import report or owner review note. It does not imply the platform crawled the external URL.

## Relationship Sketch

```text
Tenant/Site
  outbound_link_policies 1
  outbound_links *
    outbound_link_instances *
    outbound_link_audit_logs *
  outbound_link_scan_runs *
    scan findings and summary counts
```

## Lifecycle

1. Scanner discovers URL placements.
2. URL is normalized and matched to an existing registry entry or proposed as new.
3. New domains may enter `pending_review` based on policy.
4. Operators approve, disable, archive, or bulk-update links.
5. Renderer checks global link status and instance status.
6. Backup captures registry, instance, policy, scan summary, and audit export state.
7. Restore validation confirms outbound link governance state is preserved.
