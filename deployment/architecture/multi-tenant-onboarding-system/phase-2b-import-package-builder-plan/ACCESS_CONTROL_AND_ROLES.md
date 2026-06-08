# Access Control And Roles

## Roles

| Role | Can do | Cannot do |
| --- | --- | --- |
| Viewer | View redacted draft status, validation status, and support summaries. | Edit fields, export packages, approve gates, view secrets. |
| Intake editor | Fill business/domain intake fields, save drafts, request review. | Approve legal/privacy, run external actions, override validator blockers. |
| Content editor | Edit page titles, route proposals, content placeholders, SEO descriptions, media alt text. | Change tenant identity, deployment profile, DNS, form routing, or approval gates. |
| Technical operator | Select deployment profile, run offline validator, review package generation, export support packet, prepare handoff. | Perform external mutations from the builder or bypass final hard stops. |
| Tenant admin | Confirm business ownership, content approval, form owner, analytics decision, monitoring owner, rollback owner. | View or enter runtime secrets, perform Search Console/indexing from builder. |
| Super admin | Manage role assignments, approve exceptional draft export policy, configure builder templates. | Use Phase 2B planning as authorization for external mutation. |

## Approval Rules

- Legal/privacy approval must come from the assigned legal/privacy reviewer.
- Form recipient approval must come from the form owner or tenant admin.
- Rollback owner must be assigned before operator handoff.
- Indexing owner can be recorded, but Search Console/indexing remains blocked.
- External action approval is out of scope for this builder.

## Secret Handling

No role can enter, view, export, or recover secret values in package fields. Runtime-only values must be represented by safe presence flags.
