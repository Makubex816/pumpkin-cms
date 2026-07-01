# Static Publish Snapshot Backup Result

Classification: `metadata_covered_artifact_copy_deferred`

The protected bundle includes a static publish snapshot summary. V2.8.52A did not copy generated static publish artifacts into the protected backup bundle.

Restore impact:

- CMS-backed pages, theme, media records, and media binaries are covered for restore planning.
- Static site output can be regenerated from CMS state after target approval.
- If exact static artifact replay is required, a later protected artifact capture phase should copy the generated static output outside the repo and checksum it.
