# Production / Indexing Readiness Matrix

Production and indexing are not ready.

| Gate | Status | Blocks Production/Indexing | Reason | Required Resolution |
| --- | --- | --- | --- | --- |
| CMS import/update | not done | yes | Approved pages are not in CMS. | Import only after all CMS import blockers resolve. |
| Business values | unresolved | yes | Phone/email/name/service-area/region remain TBD. | Resolve or approve omission. |
| Media assets | unresolved | yes | Required MediaAsset IDs are missing. | Upload/select approved active assets. |
| Legal/business display name | unresolved | yes | Required for production contact/footer/schema review. | Provide approved name. |
| Phone/email schema policy | unresolved | yes | Cannot include fake or unapproved contact data. | Approve display/schema policy. |
| Service-area/schema policy | unresolved | yes | Cannot publish unsupported claims. | Approve service-area/region wording. |
| Human approvals | unresolved | yes | No approval record exists. | Record approvals. |
| Admin preflight | not run | yes | Import package has not passed dry-run preflight. | Run preflight. |
| Fresh static regeneration | not run | yes | No post-import static package exists. | Regenerate after CMS import. |
| Static/staging validators | not run for post-import output | yes | No fresh output exists. | Run validators. |
| Azure staging review | not run | yes | Default-host staging review remains required. | Deploy/review later. |
| Form smoke test | not run | yes | Runtime/static form behavior must be proven after import/staging. | Run staging-safe tests. |
| Robots/sitemap/canonical/schema QA | not run for post-import output | yes | Needs fresh generated output. | Verify after regeneration. |
| Production cutover approval | not approved | yes | Governance approval missing. | Approve launch/cutover. |
| Future city page | not included | no for current 3-page launch | No target city/state is approved. | Create later only by explicit request. |

## Production Decision

Ready for production/indexing: no.
