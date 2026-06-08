# Import Order

This is the proposed future order for a separately approved CMS import execution. No execution is approved now.

1. Confirm exact future approval text, tenant, package path, evidence path, allowed systems, excluded systems, rollback owner, and hard stop before live pages.
2. Verify package path points to the validated Roller local package.
3. Parse all JSON files.
4. Re-run local schema, cross-file, URL, secret, form, media, route, and SEO validation.
5. Confirm support packet and operator handoff have been reviewed.
6. Confirm owner/content/media/form/legal/privacy/monitoring/rollback/indexing responsibilities.
7. Confirm no secrets, protected paths, private customer data, tokenized URLs, or raw credentials exist.
8. Confirm no external systems are authorized.
9. Create or verify tenant shell in draft/preview CMS scope only.
10. Create or verify site shell in draft/preview CMS scope only.
11. Import theme/settings in draft/preview scope.
12. Import route allowlist and forbidden route list.
13. Import page/content block records for approved routes only.
14. Import media references/placeholders only.
15. Import forms with `no-email`, `leadRecipientRef`, and matching `recipientGroup`.
16. Import SEO and redirect metadata with `noindex,nofollow` and sitemap disabled until final gate.
17. Run CMS readback verification.
18. Produce CMS import evidence and redacted operator handoff.
19. Stop before static generation, deployment, email tests, Search Console, indexing, external checks, production readiness, or live pages.

## Ordering Rationale

Tenant and site scope must exist before scoped child records. Routes should exist before pages. Pages can then reference media/form IDs. SEO, redirects, and theme settings should be imported after core route/page consistency is known.
