# Production Sequence

Generated: 2026-06-04

## Recommended Top-Down Sequence

Every execution step below requires explicit user approval before it begins.

1. Production media setup preflight.
2. Production media infrastructure approval.
3. Azure Blob/container creation only after approval.
4. Cloudflare media domain planning and approval.
5. Media upload plan.
6. MediaAsset update plan.
7. Media validation.
8. Static form endpoint preflight.
9. Endpoint deployment approval.
10. Form endpoint local/staging test.
11. Microsoft 365/email delivery planning and approval.
12. Environment variables/secrets setup.
13. Rerun Ice static export with production media/form settings.
14. Strict validators pass.
15. Azure Static Web App staging setup.
16. Staging deployment.
17. Staging smoke test.
18. Production cutover approval.
19. Cloudflare/DNS cutover.
20. Production smoke test.
21. Indexing/sitemap finalization.
22. Post-launch monitoring.

## Gate Dependencies

Media readiness should complete before static output quality gates can pass.

Static form endpoint readiness should complete before contact form production readiness can be marked `yes`.

Azure staging should wait until:

- route proof is clean
- production media is ready, or staging has an explicitly approved exception
- static form endpoint is ready, or staging has an explicitly approved exception
- strict validators pass, or any remaining staging-only failure is documented and approved

DNS cutover should wait until Azure staging smoke tests pass and rollback is ready.

## Planning-Only Result

Sequence documented. No step was executed in this run.

