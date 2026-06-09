# Public HTML Style Bundle Analogy

Traditional hosting often gives a site owner a `public_html` folder where public files live. The Pumpkin tenant bundle should keep that intuitive shape while avoiding the unsafe parts of old shared hosting.

## Similarities

- A site has an obvious public root: `public/`.
- Route folders map to visible pages.
- Static files, sitemap, robots, and assets are easy to inspect.
- Operators can hand off a site-level folder for review.

## Safer Differences

- `public/` is generated output, not the editing source.
- CMS source, media metadata, blob copies, config inventory, backups, and restore reports are separate folders.
- Backup artifacts are ignored/private by default.
- Secrets are never mixed into the site bundle.
- Tenant/site manifests describe what is source, generated, private, or restore-only.
- Multi-site tenants are isolated under `tenants/{tenantKey}/sites/{siteKey}/`.
- A site bundle cannot publish itself without a separate deployment approval.

## Operator Mental Model

Use:

- `public/` to inspect what the visitor sees;
- `cms-content/` to inspect what the CMS owns;
- `media/` to inspect media references and binary backup status;
- `backups/` to inspect backup completeness;
- `restore/` to inspect recovery proof;
- `operator-handoff/` to inspect approvals, DNS, form/email, and rollback notes.

