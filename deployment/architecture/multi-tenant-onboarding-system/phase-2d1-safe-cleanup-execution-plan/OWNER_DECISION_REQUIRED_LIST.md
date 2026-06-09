# Owner Decision Required List

## Decisions Required Before Any Further Cleanup

1. Whether to stage and commit the Phase 2D-1 package.
2. Whether to stage prior untracked onboarding report/packages in the exact docs batches listed in `SAFE_STAGING_BATCH_PLAN.md`.
3. Whether to perform a separate reviewed pass for the large modified tracked onboarding architecture docs.
4. Whether to review app source changes under `apps/ice-rink-web/` separately from onboarding docs.
5. Whether to review static/Azure planning changes separately from onboarding docs.
6. Whether raw `content-review` inputs should be retained, archived, moved, or processed by a content-ingestion owner.
7. Whether any ignored generated output should be deleted later, with exact path approvals.
8. Whether to proceed to Roller reconciliation planning only.

## Decisions Not Approved By Phase 2D-1

- CMS import execution.
- CMS writes.
- MediaAsset writes.
- Static generation.
- Deployment.
- Azure changes.
- Cloudflare changes.
- DNS changes.
- Function App setting changes.
- Email/Microsoft 365 changes.
- Search Console or indexing actions.
- Live-page publication.

## Immediate Recommendation

Approve only docs-only staging by exact batches after reviewing this package.

Keep raw inputs, ignored generated output, protected config, app source, and static/Azure work untouched until separate owner decisions exist.
