# Security Boundary Summary

Status: boundaries maintained.

V2.8.6 did not perform:

- deployment
- DNS change
- Search Console/indexing
- live publication
- external crawling or live HTTP checks
- CMS writes
- MediaAsset writes
- provider data writes
- additional OLM staging writes
- production database migration
- production writes
- Azure infrastructure mutation
- RBAC assignment
- protected config read
- `.env.local` read, print, copy, move, rename, parse, source, or modification
- Key Vault secret query
- keys/listKeys
- connection string generation
- SAS generation
- secret export

Generated `.tmp` evidence remains ignored and must not be staged.
