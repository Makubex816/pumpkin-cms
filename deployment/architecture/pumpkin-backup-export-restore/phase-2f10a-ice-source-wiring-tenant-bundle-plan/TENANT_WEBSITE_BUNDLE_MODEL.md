# Tenant Website Bundle Model

## Goal

Create a tenant/site bundle model that gives operators the clarity of a `public_html` folder while preserving multi-tenant safety, source separation, backup awareness, and restore validation.

## Proposed Structure

```text
tenants/
  ice-rink-rentals/
    tenant.json
    tenant-manifest.json
    sites/
      ice-rink-rentals/
        site.json
        public/
          index.html
          contact/
          service-areas/
          sitemap.xml
          robots.txt
          _next/
        cms-content/
          pages/
          routes/
          forms/
          seo/
          theme/
        media/
          metadata/
          blob-map/
          blobs/
          MEDIA_BLOBS_NOT_INCLUDED.md
        forms/
          endpoint/
          validation/
          submissions-not-included.md
        static-evidence/
          manifests/
          validators/
          smoke-results/
        config-inventory/
          env-inventory.redacted.json
          CONFIG_VALUES_REDACTED.md
        backups/
          standard/
          database/
          media/
          checksums/
        restore/
          dry-runs/
          reports/
        operator-handoff/
          approvals/
          rollback/
          dns/
          email/
        manifests/
          site-bundle-manifest.json
          source-map.json
          checksum-index.json
```

## Rules

- Tenant can contain multiple sites.
- Site bundle is portable as evidence, not automatically deployable.
- `public/` is generated/static output, not CMS source.
- `cms-content/` is structured source export.
- `media/metadata/` and `media/blobs/` are separated.
- `backups/` may reference ignored/private artifacts rather than contain them in Git.
- `config-inventory/` is redacted presence-only.
- Encrypted escrow is not inside standard bundle; it is a sibling/linked recovery package under separate approval.
- `restore/` contains dry-run evidence unless a separate restore approval exists.

