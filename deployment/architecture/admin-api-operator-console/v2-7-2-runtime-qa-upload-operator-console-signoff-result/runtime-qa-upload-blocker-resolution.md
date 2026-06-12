# Runtime QA Upload Blocker Resolution

Status: `resolved`

The previous blocker was:

- `runtime-qa-staging` container metadata was readable.
- Blob list/upload failed through Azure Identity/RBAC because Storage Blob data-plane permission was missing.

V2.7.2 resolution:

- Confirmed Azure CLI login and staging subscription context.
- Confirmed storage account `pumpkincmsstgolm01`.
- Confirmed container `runtime-qa-staging`.
- Resolved explicit current Azure user principal.
- Assigned `Storage Blob Data Contributor` at the `runtime-qa-staging` container scope only.
- Verified blob list through `--auth-mode login`.
- Uploaded and listed four non-secret Runtime QA evidence files.

The upload blocker is no longer active.
