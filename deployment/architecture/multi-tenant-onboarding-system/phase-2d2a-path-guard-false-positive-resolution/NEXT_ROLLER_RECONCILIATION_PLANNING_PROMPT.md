# Next Roller Reconciliation Planning Prompt

```text
Approve Phase 2D-3 Roller CMS reconciliation planning only.

Use committed Phase 2C-6B read-only current-state evidence and the Phase 2D repo hygiene/staging reports to produce a no-write reconciliation plan for RollerRinkRentals.com.

Scope:

- Work only from local repo filesystem and terminal.
- Do not perform CMS writes.
- Do not import content.
- Do not create tenants, pages, routes, domains, media assets, redirects, or form recipients.
- Do not run POST, PUT, PATCH, or DELETE requests.
- Do not modify Azure, Cloudflare, DNS, deployment targets, Function App settings, email, Microsoft 365, Search Console, indexing, or live pages.
- Do not read protected config or print secrets.
- Keep IceSkatingRinkRentals.com separate at final human review before Search Console/indexing.
- Treat RollerRinkRentals.com as the next Pumpkin target with live pages hard-stopped.

Planning outputs:

- Reconcile existing Roller tenant/site/domain/page/current-state evidence.
- Identify route and form-recipient conflicts.
- Define a no-write import readiness decision tree.
- Define exact human approvals needed before any future CMS import execution.
- Produce a go/no-go recommendation for planning only.
```
