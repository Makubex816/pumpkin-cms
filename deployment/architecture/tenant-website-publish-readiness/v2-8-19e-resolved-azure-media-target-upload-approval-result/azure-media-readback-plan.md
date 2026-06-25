# Azure Media Readback Plan

This is a plan only. V2.8.19E performed no upload and no post-upload readback.

## Auth Boundary

Future readback must use Azure CLI login/RBAC only:

```text
--auth-mode login
```

Do not use account keys, `keys/listKeys`, connection strings, SAS, or fallback key auth.

## Future Readback Steps After Explicit Upload Approval

1. List planned uploaded blob names with `az storage blob list --auth-mode login`.
2. Read each uploaded blob's properties with `az storage blob show --auth-mode login`.
3. Verify `contentType` is `image/png`.
4. Verify `cacheControl` is `public, max-age=31536000, immutable`.
5. Verify byte size matches the upload-staging file.
6. Verify canonical blob name matches the final upload manifest.
7. Verify public URL shape uses `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/{blobName}`.
8. Run public blob URL HEAD checks only in a future phase where that outbound check is explicitly approved.
9. Confirm the 3 contact replacement rows are absent unless owner approval changes.
10. Save readback evidence to docs/JSON only, without printing secrets.

## No-Delete Rollback Plan

V2.8.19E approves no delete operation. If a future approved upload phase has a partial failure, the default rollback posture is:

- Stop further uploads.
- Do not delete newly uploaded blobs without separate explicit delete approval.
- Record which blobs were created and their properties.
- Leave production-bound deploy blocked.
- Request a scoped remediation approval if cleanup or overwrite is needed.
