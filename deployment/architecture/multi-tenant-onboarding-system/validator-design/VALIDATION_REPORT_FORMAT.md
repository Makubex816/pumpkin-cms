# Validation Report Format

Recommended fields:

```json
{
  "tenantId": "example-rink-rentals",
  "siteKey": "example-rink-rentals",
  "gate": "import-package",
  "status": "fail",
  "externalMutationPerformed": false,
  "summary": "The contact page route is not approved.",
  "findings": [],
  "nextActions": [],
  "evidencePaths": []
}
```

Markdown reports should include:

- status table
- blocking errors
- warnings
- owner-friendly explanation
- operator detail
- boundary confirmation

