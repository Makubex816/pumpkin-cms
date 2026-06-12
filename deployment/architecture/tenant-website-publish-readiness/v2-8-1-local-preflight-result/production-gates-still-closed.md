# Production Gates Still Closed

Production gates remain closed after V2.8.1:

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

The next phase may prepare a sanitized local publish package dry-run, but it must not publish or mutate live systems without explicit approval.
