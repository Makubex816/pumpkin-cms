# Manifest Checksum Integration Plan

## Manifest Changes

Future database/media completion execution should update or create a completion bundle manifest with:

- `componentStatus.database` changed from `not_included_no_approved_export_tooling_or_env` to the selected result;
- `componentStatus.media` changed from metadata-only to media-copy result when blobs are copied;
- `databaseArtifacts[]` entries for database evidence/export artifacts;
- `mediaBlobArtifacts[]` entries for copied media blobs or backup-storage references;
- artifact sizes and checksums;
- capture timestamps;
- redacted source/destination labels;
- restore validation status.

## File List Changes

Add only approved files to the manifest file list:

- database evidence JSON/Markdown;
- encrypted/portable database artifact reference or local artifact path under ignored output;
- database artifact checksum file;
- media blob copy manifest;
- media blob checksum file;
- media copy result report;
- updated validation report;
- updated restore-plan report.

## Checksum Rules

- Every artifact file must be checksummed with SHA-256.
- Checksums must be recomputed after any copy/move operation.
- Checksum files must not include themselves.
- Database and media checksums may be recorded in standard backup manifests because they are integrity values, not secrets.
- If an artifact is stored in private backup storage rather than local output, record checksum and redacted storage label only.

## Incomplete Status Rules

If database or media execution is skipped, the manifest must keep the component as incomplete and include the reason. Do not mark production restore proof complete when either database artifact proof or media binary proof is missing.

