# Rollback Plan

## Current Partial Change

Account-level Blob public access was enabled:

```text
storage account: iceskatingmedia
allowBlobPublicAccess: true
```

The container remains private:

```text
container: ice-rink-rentals-media
publicAccess: null
```

## Rollback If Requested

If a future explicit rollback approval is given, revert account-level Blob public access for `iceskatingmedia` only.

Do not perform rollback without approval.

## Current Risk

Because container public access is still unset, the approved uploaded blobs are not anonymously readable. Direct public URLs return `404`.

