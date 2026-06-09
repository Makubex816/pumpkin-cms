# Next Roller Reconciliation Planning Prompt

Use this prompt only after the Phase 2D-1 cleanup/staging package is reviewed.

```text
Approve Phase 2D-2 Roller CMS reconciliation planning only.

Use the committed Phase 2C-6B read-only current-state evidence and the Phase 2D cleanup reports to produce a no-write reconciliation plan for RollerRinkRentals.com.

Required scope:

- Work only from the local repo filesystem and terminal.
- Do not perform CMS writes.
- Do not import content.
- Do not create tenants, pages, routes, domains, media assets, redirects, or form recipients.
- Do not run POST, PUT, PATCH, or DELETE requests.
- Do not modify Azure, Cloudflare, DNS, deployment targets, Function App settings, email, Microsoft 365, Search Console, indexing, or live pages.
- Do not read protected config or print secrets.
- Keep IceSkatingRinkRentals.com separate at final human review before Search Console/indexing.
- Treat RollerRinkRentals.com as the next Pumpkin target, with live pages hard-stopped.

Planning outputs:

- Reconcile existing Roller tenant/site/domain/page/current-state evidence.
- Identify route and form-recipient conflicts.
- Define a no-write import readiness decision tree.
- Define the exact human approvals needed before any future CMS import execution.
- Produce a go/no-go recommendation for planning only.

Hard stops:

- No CMS import approval.
- No CMS write approval.
- No static generation approval.
- No deployment approval.
- No production readiness execution approval.
- No Search Console/indexing approval.
- No live-page publication approval.
```
