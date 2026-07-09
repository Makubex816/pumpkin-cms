# Pumpkin Tenant-Parameterized Backup Exporter V2.8.61OF

Status: implemented and proved for Party Pros.

Exporter path: `deployment/architecture/pumpkin-platform/backup-manager-export/v2-8-61of/tenant-backup-export.mjs`.

The exporter accepts tenant-specific data from the approved secure JSON, validates approval flags, verifies SuperAdmin login, reads tenant-scoped data through source-supported admin read routes, validates expected counts before output, downloads tenant media through blob URLs without storage keys/listKeys/SAS, writes an outside-repo backup bundle, and validates checksums.

It generalizes the V2.8.61A-style backup behavior without editing or removing the existing Ice/Airstrip paths. The OF proof wrapper intentionally restricts output to the approved tenant backup handoff folder.

Safety properties:

- Refuses to overwrite a non-empty backup output folder.
- Redacts secret-like fields in exported database JSON.
- Sanitizes users/admins.
- Excludes secrets, appsettings, connection strings, tokens, cookies, storage keys, listKeys output, and SAS tokens.
- Does not deploy, mutate DNS/custom domains, probe Airstrip, submit forms, run customer-facing POSTs, create Azure resources, or stage outside backup payloads.
