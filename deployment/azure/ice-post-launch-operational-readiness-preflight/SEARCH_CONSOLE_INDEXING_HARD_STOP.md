# Search Console and Indexing Hard Stop

Generated: 2026-06-06

## Hard Stop

Search Console and indexing actions are not authorized in this preflight.

Do not perform any of the following until the manual owner review gates are complete and the user gives explicit final indexing approval:

- Search Console property verification or changes
- sitemap submission
- URL Inspection
- indexing request
- final indexing enablement declaration
- indexing monitoring inside Search Console

## Current Technical Readiness

The site is technically ready for a future final indexing approval:

- approved routes return 200 on apex and `www`
- sitemap returns 200 and lists canonical trailing-slash URLs
- robots.txt returns 200 and permits indexing
- page robots meta is `index,follow`
- no noindex on approved pages
- no hidden draft/review/indexing blocker payloads found
- obsolete/preview routes return 404

## Approval Still Required

Technical readiness does not authorize Search Console work.

Final approval must explicitly name the indexing actions, for example:

```text
Approve Ice final Search Console/indexing submission only: submit the production sitemap, optionally inspect/request indexing for the canonical approved routes, document results, and keep all non-indexing systems unchanged.
```

Until then, indexing remains hard-stopped.
