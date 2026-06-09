# Preserve Adopt Update Create Decisions

## Recommended Decisions

| Entity | Recommendation | Future approval needed |
| --- | --- | --- |
| Existing active tenant | Preserve and adopt if owner confirms it is the intended Roller tenant | read-only refresh, owner signoff |
| Site/domain metadata | Preserve and adopt if it maps to `rollerrinkrentals.com` only on intended tenant | read-only refresh |
| `home` page | Adopt existing page if content matches package intent; update only if owner approves deltas | content comparison, CMS write approval |
| `contact` page | Adopt existing page if form/page content matches package intent; update only if owner approves deltas | content comparison, form review, CMS write approval |
| `service-areas` page | Create/import later because it is missing | explicit CMS write approval |
| `roller-rink-rentals` page | Preserve for now; determine whether it is a landing page, legacy page, or duplicate | owner purpose decision |
| draft duplicate/test page | Preserve/no-op for this reconciliation | separate cleanup approval |
| Form recipient reference | Preserve local `roller-rink-leads` reference; verify registry separately | read-only refresh or implementation support |
| Media reference `hero-roller-rink` | Preserve as local reference; do not create MediaAsset now | media rights and CMS write approval |
| Sitemap/noindex | Preserve current state until owner decides final indexing policy | CMS write approval, final indexing gate |

## Decision Rule

When existing CMS state and local package state differ, default to preserve existing CMS records and require owner-approved deltas before any update.
