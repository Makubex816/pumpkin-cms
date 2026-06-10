# Admin UI Workflow Plan

No Admin UI implementation is approved in Phase 2H-7.

## Screens

| Screen | Purpose |
| --- | --- |
| Outbound Links Dashboard | Search, filter, triage, and review tenant-scoped outbound links |
| Link Detail | Inspect one registry record, policy state, usage summary, related scan runs, and audit history |
| Usage / Instances | Review every placement for a link or tenant/site |
| Domain Management | Review domain-level allow/block/review policy |
| Bulk Actions | Preview and later execute selected or filtered changes |
| Scan Run History | Review local, import-package, backup-bundle, and future live-readonly scan evidence |
| Audit Log | Read-only governance history |
| Tenant Policy Settings | Configure default behavior and domain policy after future write approval |
| Review Required Queue | Resolve pending-review links and domains |
| Backup / Onboarding Export Status | Show whether OLM state is included in standard backup and tenant bundle handoffs |

## Primary Operator Flow

1. Operator opens dashboard for one tenant/site.
2. Operator filters by status, domain, page, or review state.
3. Operator opens link detail or instances view.
4. Operator reviews policy and audit history.
5. In read-only phases, actions are disabled and explain the required future approval.
6. In future write-approved phases, status or policy changes require reason text and show a preview where applicable.

## UI State Rules

- The selected tenant/site must be visible and enforced.
- Read-only mode must disable write controls.
- Future write mode must show preview counts before bulk execution.
- Cross-tenant actions are hidden unless the user has a cross-tenant role and explicitly selects a reporting mode.
- No UI screen should initiate external crawling or live URL checks in this implementation plan.

