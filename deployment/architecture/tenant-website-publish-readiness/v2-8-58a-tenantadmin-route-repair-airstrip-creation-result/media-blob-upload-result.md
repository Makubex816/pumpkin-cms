# Media Blob Upload Result

Blob upload result: failed.

Observed blocker:

- Azure CLI data-plane operations emitted permission errors requiring a Storage Blob data role.
- No storage key/listKeys/SAS fallback was used.
- Public Blob URL readback returned HTTP 404 for all 13 target blobs.

Created blob count proven by public readback: 0.

The run stopped before tenant creation.

