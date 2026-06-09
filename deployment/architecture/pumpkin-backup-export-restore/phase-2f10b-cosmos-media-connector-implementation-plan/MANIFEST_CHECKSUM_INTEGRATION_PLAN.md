# Manifest And Checksum Integration Plan

## Manifest Additions

The standard backup manifest should add component records for database and media:

```json
{
  "database": {
    "provider": "cosmos",
    "mode": "portable-json",
    "platformEvidence": {
      "status": "complete",
      "path": "database/platform-evidence/cosmos/cosmos-platform-backup-evidence.json"
    },
    "portableExport": {
      "status": "complete",
      "path": "database/cosmos-json/export-manifest.json",
      "recordSets": []
    }
  },
  "media": {
    "provider": "azure-blob",
    "mode": "full-copy",
    "metadataPath": "media/metadata/media-assets.json",
    "blobMapPath": "media/blob-map/blob-map.json",
    "blobInventoryPath": "media/blob-map/blob-inventory.json",
    "blobCopyStatus": "complete"
  }
}
```

## Status Values

- `complete`
- `partial`
- `blocked`
- `not-run`
- `excluded`

## Checksum Rules

- Every exported JSON file must have an individual SHA-256 checksum.
- Every copied blob must have a checksum when content is available locally.
- Platform evidence files must be checksummed.
- Bundle-level `checksums.sha256` must include relative paths only.
- The validator must fail if a manifest artifact is missing from the checksum file.
- The validator must fail if a checksum file references a missing artifact.
- The validator must fail on tampering.

## Provenance Fields

Each connector output should include:

- Connector name.
- Connector contract version.
- Profile.
- Approval reference.
- Started timestamp.
- Completed timestamp.
- Source status.
- Redaction status.
- Validation status.

The manifest must not include secrets or raw credential material.
