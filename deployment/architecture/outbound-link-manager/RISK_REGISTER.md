# Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scanner misses links in unsupported fields | Unmanaged external links remain | Declare link-bearing fields and add warnings for unsupported rich content. |
| Overbroad domain bulk action | Valid links disabled accidentally | Preview-first workflow, exact affected counts, elevated permission, audit reason. |
| Tenant scope leak | Cross-tenant data exposure | Tenant/site fields on all records and mandatory scoped queries. |
| Static output diverges from Admin state | Published links differ from registry | Use outbound link state snapshot during static build. |
| Disabled link harms page readability | Poor user experience | Policy supports plain text, hidden, disabled state, and fallback. |
| Audit logs grow large | Backup size and query cost increase | Export bounded audit summaries and retention policy. |
| Import package introduces unreviewed domains | Publication risk | Onboarding validation and publication hard stop. |
| False sense of link health | Operators assume links were crawled | Clearly label `broken_unverified`; no external crawling by default. |
| Renderer bypass | Components emit raw anchors | Renderer integration tests and component lint/validation gates. |
| Future live scan overreaches | Unapproved live reads or writes | Separate approval, read-only mode names, and no protected config access. |
