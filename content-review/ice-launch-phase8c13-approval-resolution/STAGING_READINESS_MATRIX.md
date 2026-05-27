# Staging Readiness Matrix

Azure/default-host staging is not ready.

| Gate | Status | Blocks Staging | Reason | Required Resolution |
| --- | --- | --- | --- | --- |
| CMS import/update | not done | yes | Staging needs approved CMS content first. | Complete CMS import after all import blockers resolve. |
| Business values | unresolved | yes | Phone/email/name/service-area/region remain TBD. | Resolve or approve omission. |
| Media assets | unresolved | yes | Required page media is missing. | Upload/select approved MediaAssets. |
| Human approvals | unresolved | yes | No approval record exists. | Record approvals. |
| Admin preflight | not run | yes | Import package has not been dry-run through admin preflight. | Run dry-run preflight. |
| Static regeneration | not run | yes | No fresh package exists after CMS import. | Regenerate after CMS import. |
| Static/staging validators | not run for post-import output | yes | No fresh output exists. | Run validators after regeneration. |
| Staging deployment | not run | yes | Azure staging is intentionally not performed. | Deploy later only with approved credentials/tools. |
| Form smoke test | not run | yes | Runtime/static form paths need staging-safe QA. | Run after staging deployment. |

## Staging Decision

Ready for staging: no.
