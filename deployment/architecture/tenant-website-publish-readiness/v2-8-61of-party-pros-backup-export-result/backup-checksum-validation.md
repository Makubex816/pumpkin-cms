# Backup Checksum Validation

Checksum validation status: passed.

- Checksum entries: 678
- Checked entries: 678
- Failures: 0
- `checksums.sha256` SHA-256: `162aae8d38039804221ee8644703f561642c5f5f3e026f3ed15925114707844d`
- `manifest.json` SHA-256: `b97153839a8ebe1dc171b6c03ef7b3baab11af84ad3d097baa46c04efbd5a6b1`
- `tenant-summary.json` SHA-256: `71745ddddf698811424f67e932c20ccf26b10868e7bb931c819f7439fe29a2ad`
- `validation/backup-validation-report.json` SHA-256: `b8f5b3bf2fb5330d10b05e114a19f7064fa2cf87b6ad69e9a412ac27cb1a01c1`

The checksum manifest excludes `checksums.sha256` and `validation/backup-validation-report.json` to avoid self-referential checksum churn. Payload files, database exports, media files, website package metadata, restore seed, and resource maps are covered.
