# Offline Editing Package Model

## Purpose

Offline editing packages let humans review and edit tenant content safely without receiving database dumps, secret material, protected config, or platform credentials.

## Included

- Tenant content JSON.
- Markdown content summaries.
- Route/page list.
- Media reference manifest without signed URLs.
- Form definition summary without credentials.
- SEO metadata.
- Validation report.
- Editing instructions.

## Excluded

- Secrets.
- Escrow payloads.
- Database exports.
- Raw protected config.
- Private customer data outside the selected tenant content scope.
- Generated static output unless converted to safe evidence.

## Import Back

Offline edits must be revalidated through schema, route, media, form, SEO, and secret scans before any CMS write/import execution is considered.

## Compatibility

Offline editing packages can be derived from standard backups but are not substitutes for restore-capable backup bundles.
