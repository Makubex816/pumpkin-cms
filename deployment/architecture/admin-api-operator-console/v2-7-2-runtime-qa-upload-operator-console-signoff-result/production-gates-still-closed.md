# Production Gates Still Closed

Status: `closed`

Still closed:

- Production database migration.
- Production provider writes.
- CMS writes.
- MediaAsset writes.
- App deployment.
- DNS changes.
- Search Console/indexing.
- Live-page publication.
- External crawling/live outbound URL checks.
- Destructive rollback deletion.

The only Azure mutation in V2.7.2 was the approved staging-scoped Storage Blob data-plane RBAC assignment for `runtime-qa-staging`.
