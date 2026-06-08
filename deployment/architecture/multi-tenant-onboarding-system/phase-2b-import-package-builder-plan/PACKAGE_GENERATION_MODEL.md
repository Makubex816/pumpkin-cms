# Package Generation Model

## Generated Folder Shape

```text
new-tenant-import-package/
  README.md
  manifest.json
  tenant.json
  owner-contacts.json
  site.json
  routes.json
  pages/
    home.json
    contact.json
  media-assets.json
  forms.json
  seo.json
  theme.json
  redirects.json
  approvals.json
  validation-report.json
  VALIDATION_REPORT.md
  support-packet.json
```

## Source Of Truth

The wizard draft is the source of truth until export. Export is deterministic: the same draft inputs, schema version, and generator version must produce the same JSON files.

## File Mapping

- `manifest.json`: package metadata, file list, schema version, generator version, validation status.
- `tenant.json`: tenant identity, display name, business type, CMS slug, runtime-only placeholders.
- `owner-contacts.json`: owner assignments for business, content, media, form, legal/privacy, DNS, monitoring, rollback, and indexing.
- `site.json`: domains, deployment profile, canonical host, staging metadata.
- `routes.json`: approved routes, forbidden routes, route behavior notes.
- `pages/*.json`: one file per approved page route.
- `media-assets.json`: media manifest only, not raw image bytes by default.
- `forms.json`: form metadata and public/non-secret routing intent.
- `seo.json`: canonical base URL, robots defaults, sitemap policy, indexing hard stop.
- `theme.json`: navigation derived from approved pages and safe theme defaults.
- `redirects.json`: empty list by default unless operator-approved redirect rows exist.
- `approvals.json`: manual gate state records; does not authorize external actions.
- `validation-report.json` and `VALIDATION_REPORT.md`: written by the validator after generation.
- `support-packet.json`: written by support packet export after validation.

## ID Rules

- Generate IDs from user labels by lowercasing, trimming, replacing non-alphanumeric runs with `-`, and removing leading/trailing `-`.
- IDs must be stable after first save unless the user explicitly accepts a rename impact warning.
- `tenantId`, `siteKey`, `cmsTenantSlug`, `formId`, and `mediaId` must pass the validator patterns.
- The builder must preview every generated ID before export.

## Slug And Route Rules

- Root route `/` maps to slug `home`.
- Other routes end with `/`.
- Slugs are generated from route segments unless manually edited by an operator.
- Each approved route must have exactly one page file.
- Approved routes and forbidden routes cannot overlap.
- Draft, preview, old, obsolete, unrelated-tenant, and paused-tenant routes must be treated as blockers.

## Media Rules

- `mediaId` is generated from intended use plus file name, such as `hero-rink-setup`.
- File names must be base names only, not full paths.
- Public URLs must not be localhost, staging URLs, SAS URLs, protected paths, credentialed URLs, or private network URLs.
- Raw images are not copied by default. A later safe media export requires separate design approval.

## Form Rules

- `formId` defaults to `contact-form` for the primary contact page.
- `recipient` must be an approved email address, not a password or mailbox credential.
- Endpoint secrets, Graph tokens, webhook secrets, and app passwords are runtime-only and never written.
- `staticEndpointRef` must be a placeholder/reference, not a live secret-bearing URL.

## Overwrite Behavior

- Export should require an empty output folder or an explicit overwrite confirmation.
- Existing package files should be compared with a diff preview before overwrite.
- Unknown files in an output folder should block overwrite unless a technical operator confirms they are safe.
- Protected config paths must always block export.

## Versioning

- Every generated JSON file uses `schemaVersion: "1.0.0"` while the current import schemas remain at that version.
- The wizard should record `builderVersion`, `schemaVersion`, and `validatorVersion` in draft metadata and manifest metadata.
- Schema upgrades require a migration preview and validator run before export.

## Diff Preview Before Export

The review screen should show:

- file list to be created or changed
- field-level summary of meaningful changes
- route additions/removals
- owner changes
- validation status changes
- warning that export is local-only and not an import/deployment
