# Runtime QA Upload Blocker Carryforward

Status: `blocked_before_upload_missing_storage_data_plane_rbac`

The V2.6.1 upload blocker remains active.

Known facts:

- Container metadata check previously passed.
- Blob list/upload path is blocked by missing Storage Blob data-plane RBAC.
- V2.7.1 did not retry upload.
- V2.7.1 did not assign RBAC.
- V2.7.1 did not mutate Azure.

Local Runtime QA evidence is complete and ignored under `.tmp`.
