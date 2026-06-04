# Cutover Plan

Generated: 2026-06-04

## Scope

Planning only. No DNS or Cloudflare changes occurred.

## Preconditions

Before production cutover:

- media production URL readiness is `yes`
- contact form production readiness is `yes`, or form limitation is explicitly approved
- strict validators pass
- Azure staging passes smoke test
- rollback artifact is available
- DNS rollback notes are recorded
- Cloudflare cache/bypass rules are approved
- production indexing decision is approved

## Cutover Steps

After explicit approval:

1. Confirm final artifact and commit.
2. Confirm Azure staging/default host serves approved content.
3. Confirm DNS rollback values are captured outside the repo if account-specific.
4. Lower TTL if approved and needed.
5. Update DNS records for the selected live host.
6. Configure `www` redirect/canonical behavior if used.
7. Configure media hostname routing if not already complete.
8. Verify HTTPS.
9. Verify `/`, `/contact`, `/service-areas`, `/sitemap.xml`, and `/robots.txt`.
10. Verify form only if endpoint and email/test behavior are approved.
11. Keep HTML caching conservative until purge workflow is proven.

## Production Indexing

Production indexing should be finalized only after:

- live domain serves approved routes
- sitemap and robots are correct
- no unintended `noindex`
- canonical behavior is approved

## Current Run Result

Cutover plan documented only. No cutover occurred.

