# Media Backup Result

Classification: `media_binary_backup_covered_rbac_login_only`

Media backup result:

- Blob inventory succeeded with Azure Storage RBAC `auth-mode login`.
- Blob download used RBAC `auth-mode login`.
- No storage key/listKeys, SAS generation, or connection string generation occurred.
- 9 blobs were copied into the protected bundle.
- Total protected media bytes: 22,639,448.
- Each copied media file has a SHA-256 entry in `media/manifest.json`.

Initial local-copy attempts exposed Windows path/progress handling issues, then the final short deterministic filename pass succeeded.
