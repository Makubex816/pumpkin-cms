# Noindex Sitemap Gate

## Current Policy

Local draft preview routes may remain noindex.

Approved production CMS pages intended for static deployment must not retain noindex robots metadata.

## Validator Behavior

Snapshot/static publish validation now fails if an approved production Ice page has:

- `robots` containing `noindex`
- `includeInSitemap=true` while `robots` contains `noindex`

Static output and staging package validators also fail if deployable content pages contain noindex robots meta. Generated 404 pages are excluded from this page gate.

## Required Future CMS Metadata Update

No CMS records were updated in this run. A later authorized CMS metadata task must update production-intended live pages so:

- homepage `/` does not retain noindex
- `/service-areas` does not retain noindex
- sitemap inclusion and robots metadata agree

Production indexing remains no until that task is approved and verified.

