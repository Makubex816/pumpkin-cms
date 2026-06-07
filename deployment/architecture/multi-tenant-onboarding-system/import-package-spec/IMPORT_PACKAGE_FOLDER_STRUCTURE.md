# Import Package Folder Structure

```text
new-tenant-import-package/
  README.md
  manifest.json
  tenant.json
  site.json
  routes.json
  pages/
    home.json
    contact.json
    service-areas.json
  media-assets.json
  forms.json
  seo.json
  theme.json
  redirects.json
  schemas/
  examples/
  VALIDATION_REPORT.md
  TROUBLESHOOTING.md
```

Rules:

- `manifest.json` names every file in the package.
- `tenant.json` and `site.json` establish tenant scope.
- `routes.json` is the route allowlist and forbidden route list.
- `pages/` contains one JSON file per approved page.
- Optional files may be empty arrays or empty objects where the schema allows.
- Secrets are forbidden everywhere.

