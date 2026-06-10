# Execution Scope

Approved:

- validate the Phase 2F-12O seed package
- verify the provisioned Cosmos account, database, and containers with non-secret metadata
- attempt Azure AD/RBAC data-plane read/write access without printing or persisting tokens
- write only approved Ice seed documents if all gates pass
- verify tenant-scoped readback if writes complete
- document blockers if safe data-plane access is unavailable

Not approved:

- keys/listKeys
- connection strings
- SAS generation
- protected config reads
- CMS runtime switch
- CMS writes
- MediaAsset writes
- database export
- media/blob download
- Azure resource mutation beyond approved Cosmos data-plane document writes
- deployment
- Search Console/indexing
- live-page publication
- staging generated `.tmp` execution artifacts
