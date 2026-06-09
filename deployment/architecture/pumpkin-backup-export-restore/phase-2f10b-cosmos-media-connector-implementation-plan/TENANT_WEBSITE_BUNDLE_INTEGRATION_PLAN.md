# Tenant Website Bundle Integration Plan

## Bundle Goal

The tenant website bundle should give an operator a safe, inspectable, public_html-style directory for one tenant/site while preserving CMS structure, database exports, media metadata, blob copies, static evidence, config inventory, manifests, and restore planning.

## Proposed Ice Bundle Layout

```text
tenants/ice-skating-rink-rentals/sites/iceskatingrinkrentals.com/
  public/
    static-evidence/
    routes/
  cms-content/
    pages/
    routes/
    navigation/
    forms/
  database/
    cosmos-json/
      export-manifest.json
      containers/
      checksums.sha256
    platform-evidence/
      cosmos/
  media/
    metadata/
    blob-map/
    blobs/
  config-inventory/
    redacted-config-inventory.json
    protected-config-not-read.md
  backups/
    standard-backup-manifest.json
    checksums.sha256
    validation-report.json
    validation-report.md
  restore/
    restore-plan.json
    restore-plan.md
  operator-handoff/
    README.md
    GO_NO_GO.md
  manifests/
    tenant-website-bundle-manifest.json
```

## Integration Rules

- Cosmos JSON export feeds `database/cosmos-json/`.
- Cosmos platform evidence feeds `database/platform-evidence/cosmos/`.
- MediaAsset records feed `media/metadata/`.
- Blob mapping feeds `media/blob-map/`.
- Approved copied media files feed `media/blobs/`.
- Bundle-level checksums cover every non-directory file.
- Bundle manifest records completeness status by component.
- Restore plan must report missing or blocked components clearly.

## Bundle Status Values

- `complete`: required artifacts exist and pass validation.
- `partial`: evidence exists but portable artifacts are missing.
- `blocked`: required tool/env/approval is missing.
- `not-run`: connector was not executed.
- `excluded`: owner-approved exclusion.

## Standard Backup Secret Boundary

The bundle must contain redacted config inventory only. It must not contain protected config contents, secret values, cookies, auth headers, account keys, or encrypted escrow payloads.
