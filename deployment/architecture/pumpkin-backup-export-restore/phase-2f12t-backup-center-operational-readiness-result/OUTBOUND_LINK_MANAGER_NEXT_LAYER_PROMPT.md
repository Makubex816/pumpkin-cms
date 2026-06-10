# Outbound Link Manager Next-Layer Prompt

Status: ready for next approval

Use this as the next architecture/design-only prompt after owner Backup Center signoff:

```text
Approve Phase 2G-1 Outbound Link Manager architecture and data-contract design only: design the Tenant-Scoped Outbound Link Registry and Control System as the next major product layer after Backup Center operational readiness. Produce architecture docs, data contracts, tenant isolation rules, backup/restore integration model, onboarding integration model, admin UX requirements, permissions, audit-log model, scanner/discovery design, rendering-control rules, bulk-action workflow, migration plan, validator plan, and implementation gate prompts.

Scope:
- Centralized outbound link registry per tenant/site.
- Outbound link instance tracking across pages, rich text, templates, forms, media metadata, static output evidence, and tenant website bundles.
- Scanner/discovery design for existing content and future imports.
- Rendering-control rules for rel, target, nofollow/sponsored/ugc, affiliate/referral metadata, safety labels, and broken-link states.
- Admin controls for edit, approve, suppress, bulk update, tenant-level policy, and review queues.
- Permissions and audit history for every link mutation.
- Backup Center integration so registry, instances, policies, audit history, and restore plans are included in standard backups.
- Tenant onboarding integration so imported packages declare outbound links and owner approvals.
- Restore behavior for tenant bundles and public-html-style outputs.
- Hard stops for live-page publication and indexing when outbound-link validation fails.

Do not implement code in this phase. No CMS writes, no database writes, no deployment, no Search Console/indexing, no live-page publication, no protected config reads, no external crawl beyond local/static fixtures, and no generated sensitive artifacts staged into Git.
```

Design outputs expected in the next phase:

- `OUTBOUND_LINK_MANAGER_ARCHITECTURE.md`
- `OUTBOUND_LINK_DATA_MODEL.md`
- `OUTBOUND_LINK_INSTANCE_TRACKING.md`
- `OUTBOUND_LINK_RENDERING_POLICY.md`
- `OUTBOUND_LINK_ADMIN_UX_REQUIREMENTS.md`
- `OUTBOUND_LINK_AUDIT_AND_PERMISSIONS.md`
- `OUTBOUND_LINK_BACKUP_RESTORE_INTEGRATION.md`
- `OUTBOUND_LINK_ONBOARDING_INTEGRATION.md`
- `OUTBOUND_LINK_VALIDATOR_PLAN.md`
- `OUTBOUND_LINK_IMPLEMENTATION_GATE_PROMPT.md`
