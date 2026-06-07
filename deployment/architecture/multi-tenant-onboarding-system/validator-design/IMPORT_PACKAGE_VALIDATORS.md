# Import Package Validators

Validate:

- every JSON file parses
- every JSON file has supported `schemaVersion`
- every file matches its schema
- `tenantId` and `siteKey` match across files
- manifest lists all required files
- page routes are approved
- forbidden routes do not appear as pages
- page media IDs exist in `media-assets.json`
- page form IDs exist in `forms.json`
- URLs are public and profile-compatible
- forbidden fields and secrets are absent

Import package validation must not write CMS records.

