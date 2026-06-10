# Executive Summary

Outbound Link Manager gives Pumpkin CMS a tenant-scoped governance layer for every external link used by a tenant site.

Today, outbound URLs can appear in page JSON, rich text, navigation, footer content, forms, theme settings, imported packages, and future tenant website bundles. Without a registry, operators cannot reliably answer basic questions:

- Which external domains does this tenant link to?
- Which pages use a given URL?
- Can one risky outbound URL be disabled everywhere?
- Can a single placement be hidden while the global URL remains approved?
- Will backup/restore preserve outbound link policy state?
- Are imported tenant packages introducing unreviewed external domains?

The proposed system introduces five primary records:

- `outbound_links`: canonical tenant/site outbound URL records.
- `outbound_link_instances`: each content placement of a registered URL.
- `outbound_link_policies`: tenant/site rendering and review rules.
- `outbound_link_scan_runs`: local or approved live-readonly discovery summaries.
- `outbound_link_audit_logs`: immutable change history.

Discovery is local-first. The scanner reads CMS content, tenant bundles, import packages, backup bundles, and later approved live-readonly content snapshots. It does not crawl external websites or perform link health checks in this phase.

Rendering control is deterministic. A renderer checks both the global link status and the specific placement status. Disabled links can render as plain text, hidden content, a disabled state, or a tenant-defined fallback.

This design follows Backup Generator validation because outbound link governance must be backup-aware from the start. Standard backups should eventually include registry records, instances, policies, scan summaries, and audit export policy so restore validation can prove outbound link counts and disabled states survive a backup/restore cycle.
