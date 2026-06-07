# Onboarding Phases

## Phase Sequence

1. Business and domain intake.
2. Page, route, media, form, legal, analytics, and owner intake.
3. Import package creation.
4. Schema and cross-file validation.
5. CMS preview import, only after approval.
6. Preview review and content approval.
7. Static export dry run.
8. Media production URL readiness.
9. Form endpoint readiness.
10. Staging deployment or profile-specific staging equivalent.
11. Staging smoke test and owner review.
12. Production cutover preflight.
13. Production cutover, only after approval.
14. Production smoke test and operational readiness.
15. Manual owner review before indexing.
16. Search Console/indexing final gate, only after final approval.

## Alternate Flow Support

Not every tenant must use Azure Static Web Apps, Azure Blob, Cloudflare Worker media, and Graph email. The deployment profile registry defines which gates apply for each supported production flow.

The invariant is that every profile must provide equivalent gates for route safety, media safety, form safety, staging/proof, production smoke, rollback, owner review, and indexing last.

