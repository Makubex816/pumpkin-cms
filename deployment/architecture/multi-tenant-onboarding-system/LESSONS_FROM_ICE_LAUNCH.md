# Lessons From Ice Launch

## Reusable Lessons

- A tenant launch needs route allowlists from the beginning.
- CMS snapshots and static artifacts must exclude preview/obsolete routes.
- Hidden CMS review/admin payloads can become indexing blockers if public client payloads are not sanitized.
- Sitemap and canonical URL shapes must align before production indexing.
- Media readiness is more than uploaded files; page body fields and generated output must point to approved production media URLs.
- Form readiness needs endpoint hardening, delivery proof, human inbox confirmation, and operational ownership.
- Staging and production smoke tests should check apex/primary, `www`, approved routes, forbidden routes, media, form preflight, sitemap, robots, canonical, and noindex.
- Rollback plans must preserve unrelated DNS/email/media records.
- Manual owner review is separate from technical readiness.
- Search Console/indexing must remain last.

## Productization Outcome

These lessons become the standard Pumpkin CMS tenant lifecycle, import package contract, validator pipeline, deployment profile registry, operator runbooks, and future wizard flow.

