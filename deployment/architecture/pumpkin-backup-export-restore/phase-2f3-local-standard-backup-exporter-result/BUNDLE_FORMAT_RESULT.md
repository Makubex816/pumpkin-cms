# Bundle Format Result

## Generated Folder Shape

```text
<bundle>/
  manifest.json
  checksums.sha256
  BACKUP_SUMMARY.md
  VALIDATION_RESULT.md
  validation-result.json
  RESTORE_INSTRUCTIONS.md
  database/
    DATABASE_EXPORT_NOT_INCLUDED.md
    database-export-plan.json
  cms-content/
    tenants.json
    sites.json
    pages.json
    routes.json
    forms.json
    seo.json
    redirects.json
    theme.json
  media/
    media-assets.json
    MEDIA_BLOBS_NOT_INCLUDED.md
  static/
    static-output-manifest.json
    STATIC_OUTPUT_NOT_INCLUDED.md
  config-inventory/
    env-inventory.redacted.json
    CONFIG_VALUES_REDACTED.md
  escrow/
    ESCROW_NOT_INCLUDED.md
```

## Generated Evidence

- `.tmp/tenant-standard-backup`
- `.tmp/platform-standard-backup`

These are ignored generated test outputs and must not be staged.
