# Storage Proof Security Boundary

The storage proof used Azure Identity/RBAC only.

Confirmed false:

- storage keys
- listKeys
- connection strings
- SAS generation
- protected config reads
- token printing
- secret export
- raw credential artifact upload
- CMS writes
- Cosmos writes
- OLM staging data writes
- production writes
- deployment
- indexing
- live-page publication

Only non-secret proof metadata and checksum files were uploaded.
