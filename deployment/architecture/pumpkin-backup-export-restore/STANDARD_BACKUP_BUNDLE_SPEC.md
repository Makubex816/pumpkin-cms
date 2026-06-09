# Standard Backup Bundle Spec

## Bundle Shape

```text
backup.zip/
  manifest.json
  checksums.sha256
  BACKUP_SUMMARY.md
  VALIDATION_RESULT.md
  RESTORE_INSTRUCTIONS.md
  database/
  cms-content/
  media/
  static/
  config-inventory/
  escrow/
    ESCROW_NOT_INCLUDED.md
```

## Included

- Backup manifest with schema version, scope, tenant/platform identifiers, creator, timestamps, mode, and artifact list.
- Checksums for every artifact.
- Human-readable summary.
- Validation result.
- Restore instructions for sandbox/local validation first.
- Database export metadata or encrypted database export reference, depending on approved mode.
- CMS content export files.
- Media metadata and blob-copy manifest.
- Static output/evidence snapshot where applicable.
- Redacted config inventory with names and presence only.
- Placeholder escrow folder proving escrow was not included.

## Excluded

- Secret values.
- JWTs, auth headers, cookies, sessions, SAS URLs, one-time tokens, and personal credentials.
- Protected config files.
- Raw `content-review` inputs unless explicitly converted into a redacted offline editing package.
- Ignored generated output staged into git.
- Escrow payloads in standard mode.

## Versioning

Every bundle must include:

- `schemaVersion`;
- `backupFormatVersion`;
- `pumpkinBuildRef`;
- `scopeType`;
- `tenantId` or platform marker;
- `createdAt`;
- `expiresAt`;
- `retentionClass`;
- `validationStatus`;
- `escrowIncluded: false`.

## Compatibility

Standard backups should be support-packet compatible after redaction review. Offline editing packages can be derived from the content portion, but must not inherit database exports, secret material, or private platform configuration.
