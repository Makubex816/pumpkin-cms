# Next Cosmos Export Backup Proof Prompt

Approve the next phase to perform a guarded Cosmos export/backup proof for Ice using Azure AD/RBAC data-plane access.

Required boundaries:

- use tenant-scoped reads for `tenantKey = ice-rink-rentals`
- export only approved Ice tenant documents needed for Backup Center proof
- do not use keys/listKeys, connection strings, SAS, or protected config
- do not perform CMS runtime switch
- do not perform CMS writes or MediaAsset writes
- do not deploy, index, or publish live pages
- write generated export artifacts only under ignored `.tmp`
- validate checksums, secret scan, and restore/readback model

The proof should confirm whether Ice is fully backupable from Cosmos and should keep runtime switch/export gates separate from live-page or indexing approval.
