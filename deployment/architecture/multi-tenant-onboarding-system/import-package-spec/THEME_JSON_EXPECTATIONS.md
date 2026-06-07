# Theme JSON Expectations

`theme.json` defines visual and navigation settings.

Required:

- `schemaVersion`
- `tenantId`
- `siteKey`
- `themeId`
- `displayName`
- `navigation`
- `colors`

Rules:

- Navigation links must be approved routes or approved external URLs.
- Theme files must not contain secrets.
- Tenant theme updates require approval before CMS writes.

