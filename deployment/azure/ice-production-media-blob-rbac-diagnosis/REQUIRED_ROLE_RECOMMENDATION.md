# Required Role Recommendation

Generated: 2026-06-04

## Current Blocker

The current principal lacks Blob data-plane permissions for blob listing and future upload using Microsoft Entra login auth.

## Minimum Role For Read/List

For read-only blob/container data-plane validation:

```text
Storage Blob Data Reader
```

## Minimum Role For Future Media Upload

For uploading the approved media files:

```text
Storage Blob Data Contributor
```

This role is preferred over broader roles because it grants the write permissions needed for upload without granting full management-plane ownership.

## Recommended Future Scope

Preferred narrow scope, if practical:

```text
/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia/blobServices/default/containers/ice-rink-rentals-media
```

Fallback scope, if container-scope assignment is not practical for the approved workflow:

```text
/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-ice-production-media/providers/Microsoft.Storage/storageAccounts/iceskatingmedia
```

## Not Approved In This Run

This diagnosis does not approve assigning any role.

Future role assignment requires separate explicit approval.
