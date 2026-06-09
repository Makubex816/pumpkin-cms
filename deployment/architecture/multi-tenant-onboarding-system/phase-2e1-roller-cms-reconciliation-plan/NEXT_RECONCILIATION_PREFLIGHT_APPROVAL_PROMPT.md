# Next Reconciliation Preflight Approval Prompt

```text
Approve Phase 2E-2 Roller CMS reconciliation read-only refresh only.

Use the Phase 2E-1 reconciliation plan to refresh current CMS evidence for RollerRinkRentals.com before any CMS write/import approval.

Allowed scope:

- Work only from the local repo filesystem and terminal.
- Run presence-only environment checks, printing only PRESENT or MISSING.
- Use CMS/API GET and HEAD requests only if required env vars are present.
- Summarize evidence with secrets redacted.
- Recheck the existing active Roller tenant.
- Recheck existing pages/routes for home, contact, service-areas, roller-rink-rentals, and known draft/test pages.
- Recheck sitemap inclusion, robots/noindex state, media asset counts, import run counts, active theme, and form-recipient evidence if a safe read-only source exists.
- Produce a go/no-go recommendation for later CMS reconciliation write approval.

Hard stops:

- No CMS writes.
- No tenant creation.
- No content import.
- No MediaAsset writes.
- No POST, PUT, PATCH, or DELETE requests.
- No Azure, Cloudflare, DNS, deployment, Function App setting, email, Microsoft 365, Search Console, indexing, or live-page actions.
- No protected config reads.
- No secret printing.
- No live-page publication.
```
