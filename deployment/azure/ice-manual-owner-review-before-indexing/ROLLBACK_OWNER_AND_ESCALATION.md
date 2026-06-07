# Rollback Owner and Escalation

Generated: 2026-06-06

## Status

Rollback paths are documented in prior reports. Rollback ownership and escalation are pending manual assignment.

No rollback was executed in this package.

## Owner Assignments

| Rollback area | Assigned owner | Escalation notes |
| --- | --- | --- |
| overall rollback decision owner | TBD | Must approve whether rollback is needed and which rollback path is in scope. |
| Cloudflare root/`www` DNS rollback owner | TBD | Prior fast rollback restores root and `www` A records only. |
| Azure Static Web App custom-domain owner | TBD | Optional cleanup only after traffic rollback and separate approval. |
| static content rollback owner | TBD | Redeploy known-good artifact only under separate approval. |
| Cloudflare media Worker/DNS owner | TBD | Keep media rollback scoped to media route/DNS/Worker objects. |
| Azure Blob media owner | TBD | Avoid blob deletion unless a future media-specific rollback is approved. |
| contact form delivery rollback owner | TBD | Existing mail-disable rollback is `FORM_DELIVERY_MODE=no-email`. |
| communications/escalation owner | TBD | Coordinates status, customer impact, and internal handoff. |

## Documented Rollback Sources

- `deployment/azure/ice-production-cutover-result/ROLLBACK_PLAN.md`
- `deployment/azure/ice-production-indexing-cleanup-result/ROLLBACK_NOTES.md`
- `deployment/azure/ice-post-launch-operational-readiness-preflight/ROLLBACK_PATH_REVIEW.md`
- `deployment/azure/ice-static-form-production-enablement-result/ROLLBACK_DISABLE_PLAN.md`

## Boundary

Do not execute rollback, change DNS, change Azure resources, change Cloudflare, change Function settings, redeploy, change CMS or MediaAsset records, send email, or touch Microsoft 365 without separate explicit approval.

