# Tenant Backup Exporter Result

Exporter path: `deployment/architecture/pumpkin-platform/backup-manager-export/v2-8-61of/tenant-backup-export.mjs`.

Exporter SHA-256: `2d51603689065d90a9f35bf4627ffd711b41e77132e23acf38861c5214a951ed`.

Result: passed.

The exporter reads a tenant configuration from the approved secure file, verifies SuperAdmin login, performs source-supported tenant-scoped readback, validates expected counts before writing the bundle, downloads media through blob URLs without storage keys/listKeys/SAS, writes manifest/checksum/restore metadata, and verifies the checksum manifest.

It refuses to overwrite a non-empty backup output folder. Existing Ice and Airstrip backup proof paths were not removed or changed.
