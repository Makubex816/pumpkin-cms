# Pumpkin Airstrip Media Binding V2.8.58A

Approved target:

- Storage account: `iceskatingmedia`.
- Container: `airstrip-club-las-vegas-media`.
- Prefix: `assets/`.
- Public base: `https://iceskatingmedia.blob.core.windows.net/airstrip-club-las-vegas-media`.

Result:

- 13 source assets resolved and hashed.
- Container was created with Blob public access.
- Upload/readback failed under RBAC/auth-mode login.
- Public readback returned HTTP 404 for all expected target blobs.
- Container rollback delete succeeded.
- No residual Airstrip media container exists from this run.

