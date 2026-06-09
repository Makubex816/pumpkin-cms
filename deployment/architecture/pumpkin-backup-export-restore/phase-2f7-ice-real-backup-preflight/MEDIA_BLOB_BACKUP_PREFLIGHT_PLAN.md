# Media Blob Backup Preflight Plan

## Future Media Scope

The future Ice standard backup should include:

- MediaAsset metadata;
- approved public media URL inventory;
- blob object inventory;
- content type;
- byte size where available;
- checksum/hash where available or computed during approved copy;
- alt text and attribution/license metadata where available;
- page-to-media reference map;
- media domain mapping.

## Media Domain Mapping

The known public URL pattern is:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

The future backup should preserve the mapping from CMS MediaAsset metadata to public media URLs and underlying blob inventory.

## Copy/Download Strategy

| Mode | Contents | Approval Required |
| --- | --- | --- |
| Inventory only | Metadata, URL map, file names, sizes, content types, checksums if already known | Ice full backup execution approval |
| Blob copy | Private export copy to approved storage target | Explicit media copy/download approval |
| Blob download | Local artifact copy under approved output path | Explicit media download approval |

## Validation

Future validation should prove:

- every referenced asset has metadata;
- every referenced asset exists in inventory;
- checksums match for copied blobs;
- content types match expected values;
- page references resolve;
- unrelated media is not modified;
- no signed URLs, SAS URLs, storage keys, or temporary credentials are written.

## Phase 2F-7 Boundary

No blob listing, blob copy, blob download, Azure storage command, MediaAsset write, SAS generation, or public media HTTP check occurs in this phase.
