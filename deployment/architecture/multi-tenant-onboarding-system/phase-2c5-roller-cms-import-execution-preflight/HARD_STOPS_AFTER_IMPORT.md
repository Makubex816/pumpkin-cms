# Hard Stops After Import

Even if a later CMS import execution succeeds, these actions remain blocked until separate approvals:

- static generation
- production readiness planning
- deployment
- Azure changes
- Cloudflare changes
- DNS changes
- Function App setting changes
- MediaAsset writes or binary uploads
- email or Microsoft 365 changes
- Search Console verification
- sitemap submission
- URL Inspection
- indexing request
- indexing monitoring
- live-page publication

## Required Stop Point

The future CMS import execution must stop after:

1. CMS draft/preview import completes.
2. CMS readback verification completes.
3. Created/updated IDs are captured.
4. Redacted execution evidence is written.

No later gate should be bundled into CMS import execution.
