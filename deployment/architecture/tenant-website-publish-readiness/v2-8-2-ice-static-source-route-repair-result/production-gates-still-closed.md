# Production Gates Still Closed

Still closed after V2.8.2:

- production database migration
- production provider writes
- CMS writes
- MediaAsset writes
- Azure infrastructure creation or mutation
- RBAC assignment
- deployment
- DNS change
- Search Console/indexing
- live-page publication
- external crawling or live outbound URL checks
- protected config reads
- secret export
- keys/listKeys
- connection strings
- SAS generation

V2.8.2 only repaired local static source and validated local artifacts.
