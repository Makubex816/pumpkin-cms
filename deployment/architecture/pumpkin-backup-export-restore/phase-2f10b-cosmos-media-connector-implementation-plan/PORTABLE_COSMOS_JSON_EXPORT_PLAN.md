# Portable Cosmos JSON Export Plan

## Purpose

The future portable export connector should create tenant-scoped JSON artifacts from Cosmos/provider storage so the standard backup bundle can be validated and used for restore planning without depending only on platform-level restore.

## Proposed Modules

- `src/connectors/cosmos/cosmos-json-exporter.mjs`
- `src/connectors/cosmos/cosmos-query-planner.mjs`
- `src/connectors/cosmos/cosmos-export-redactor.mjs`
- `src/connectors/cosmos/cosmos-export-manifest.mjs`
- `src/connectors/cosmos/cosmos-export-validator.mjs`

## Output Shape

```text
tenants/{tenantKey}/sites/{siteKey}/backups/database/cosmos-json/
  export-manifest.json
  containers/
    tenants.json
    sites.json
    pages.json
    routes.json
    themes.json
    media-assets.json
    forms.json
    publish-runs.json
    import-runs.json
  checksums.sha256
  EXPORT_LIMITATIONS.md
```

Container filenames should describe the logical export set, not necessarily the physical Cosmos container name.

## Default Export Classes

Default include candidates:

- Tenant metadata required to restore site ownership.
- Site metadata.
- Published page content.
- Draft page content only if owner-approved.
- Routes and slugs.
- Theme and layout references.
- MediaAsset metadata and blob references.
- Form recipient configuration after secret-leak validation.
- Publish/import run metadata needed for provenance.

Owner decision required:

- Form submissions.
- User/auth records.
- Audit events containing PII.
- Any record class containing credentials, tokens, private notes, billing data, or security-sensitive operational data.

## Tenant Scope

Every exported record must be constrained by one of:

- Tenant ID.
- Tenant slug.
- Site ID.
- Site slug.
- Route/site ownership derived from tenant metadata.

If tenant scoping cannot be proven, export must abort.

## Record Format

Each exported file should use a wrapper format:

```json
{
  "contractVersion": "1.0",
  "provider": "cosmos",
  "logicalCollection": "pages",
  "tenantScope": {
    "tenantIdPresent": true,
    "siteIdPresent": true
  },
  "recordCount": 0,
  "records": []
}
```

## Checksums

Every JSON artifact must be checksummed individually and included in the bundle-level checksum file. The exporter should also write a collection-level hash over record IDs and updated timestamps when available.

## Secret And PII Controls

The exporter must run standard backup secret-leak detection before a bundle can pass validation. PII-bearing collections must be explicitly classified, counted, and either excluded or owner-approved for backup handling.
