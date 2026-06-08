# Rollback Capture Plan

No rollback is needed for Phase 2C-5 because it performs no mutations.

## Future Import Capture Requirements

If a later CMS import execution is approved, the operator must capture created or updated CMS IDs at every write step:

| Step | IDs To Capture |
| --- | --- |
| Tenant shell | tenant ID, tenant key, status |
| Site shell | site ID, site key, canonical host metadata |
| Routes | route IDs, path, route status, allow/forbid state |
| Pages | page IDs, route, page status, revision ID if available |
| Forms | form IDs, `leadRecipientRef`, `recipientGroup`, delivery mode |
| SEO | SEO record IDs, robots policy, sitemap policy |
| Theme | theme/settings record IDs |
| Redirects | redirect IDs if any are created |

## Failure Handling

1. Stop further writes immediately.
2. Preserve the redacted command summary and timestamp.
3. Preserve the list of created or updated IDs.
4. Confirm no external systems were touched.
5. Do not delete, disable, or roll back records without explicit rollback approval.
6. Request rollback approval naming the exact Roller records and owner.

## Future Rollback Boundary

If rollback is later approved, roll back only records created or updated by the approved Roller import. Preserve unrelated tenants, media assets, email configuration, DNS, Azure, Cloudflare, deployment state, Search Console, indexing, and live pages.

## External Rollback

No external rollback should be needed if future import execution obeys the CMS-only draft/preview boundary.
