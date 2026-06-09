# Tenant Website Bundle Integration

Phase 2F-11 adds a tenant/site website bundle index for fake complete connector runs.

## Output

```text
tenants/{tenantKey}/sites/{siteKey}/
  README.md
  tenant-website-bundle-manifest.json
```

The index references standard backup artifacts rather than duplicating them:

- `cms-content/`
- `database/cosmos-json/`
- `database/platform-evidence/cosmos/`
- `media/media-assets.json`
- `media/blob-map/`
- `media/blobs/`
- `restore/`

## Purpose

The index gives operators a safer tenant-aware structure similar in spirit to `public_html` while preserving Backup Center manifests, checksums, validation, and restore planning.

## Boundary

The bundle index is local metadata only. It does not copy files to a live website, restore content, deploy static output, modify CMS records, or publish pages.
