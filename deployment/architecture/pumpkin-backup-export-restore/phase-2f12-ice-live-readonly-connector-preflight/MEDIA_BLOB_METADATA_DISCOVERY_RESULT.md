# Media Blob Metadata Discovery Result

## Result

RBAC/login blob metadata listing succeeded for `iceskatingmedia` / `ice-rink-rentals-media`.

## Summary

| Field | Result |
| --- | --- |
| Metadata listing mode | `--auth-mode login` |
| Blob contents downloaded | no |
| Blob metadata entries returned | 9 |
| Content types observed | `image/png` |
| Cache control observed | `public, max-age=31536000, immutable` |
| Total content length from metadata | 22,639,448 bytes |

## Blob Metadata Observed

All observed blobs were under:

```text
ice-rink-rentals/assets/
```

Observed blob names were production media asset paths with hashed directory components and PNG filenames. The preflight recorded metadata only: name, content length, content type, cache-control, last modified, and blob type.

## Boundary

No blob content was downloaded. No storage key, connection string, or SAS value was used or printed. No write operation was performed.
