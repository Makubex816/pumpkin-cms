# Next Reimport Plan

Do not reimport automatically from this repair run.

Recommended next action when authorized:
1. Confirm the local API and admin auth are available.
2. Run Phase 8N preflight again and require `productionFieldPersistenceOk: true`.
3. Snapshot the current homepage draft.
4. Re-run the homepage-only draft overwrite for route `/`.
5. Read back the homepage and compare against the candidate using `tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs`.
6. Verify `/contact` unchanged.
7. Verify `/service-areas` unchanged or still expected 404.
8. Keep workflow as draft/needs_review.

Do not do any of these without explicit authorization:
- Production approval.
- Static regeneration.
- Deployment.
- Theme changes.
- MediaAsset changes.
- DNS/email/provider changes.
- Roller work.

Remaining blockers before production:
- Human approval.
- Public contact/email/phone policy decisions.
- Static regeneration authorization.
- Production indexing approval.

