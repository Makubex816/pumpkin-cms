# Import Package Folder Structure

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
    service-areas.json
  media-assets.json
  forms.json
  seo.json
  theme.json
  redirects.json
  approvals.json
  schemas/
  examples/
  validation-report.json
  VALIDATION_REPORT.md
  support-packet.json
  TROUBLESHOOTING.md
```

Rules:

- `manifest.json` names every file in the package.
- `tenant.json` and `site.json` establish tenant scope.
- `owner-contacts.json` assigns business, content, legal, operator, DNS, rollback, and indexing owners.
- `routes.json` is the route allowlist and forbidden route list.
- `pages/` contains one JSON file per approved page.
- `approvals.json` records gate approvals and hard stops; it does not authorize external mutation by itself.
- `validation-report.json` and `VALIDATION_REPORT.md` record local validation outcomes.
- `support-packet.json` is a redacted help packet shape for operators.
- Optional files may be empty arrays or empty objects where the schema allows.
- Secrets are forbidden everywhere.
