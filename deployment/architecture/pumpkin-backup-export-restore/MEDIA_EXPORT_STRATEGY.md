# Media Export Strategy

## Included In Standard Backup

- MediaAsset metadata.
- Blob object inventory.
- Content type, byte size, hash/checksum where available.
- Alt text and attribution/license metadata.
- Page-to-media reference map.
- Copy plan or storage-location manifest.

## Blob Copy Strategy

Large binary media should not be pushed through the browser. A worker should create a private copy/export job, checksum artifacts, and expose a time-limited authenticated download link.

## Security

- Media exports may contain private or licensed customer assets and should be treated as sensitive.
- Signed URLs are not copied into standard backups.
- Temporary storage credentials are not logged.

## Restore Validation

Media restore validation should prove:

- every referenced asset exists;
- checksums match;
- content types match expected values;
- alt text and metadata survived;
- page references resolve;
- unrelated media assets were not changed.

## Non-Action

Phase 2F-1 does not copy, download, upload, or inspect real media blobs.
