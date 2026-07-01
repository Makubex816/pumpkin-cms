# Real Tenant Required Data Checklist

The partner real tenant package should provide or reference:

- Tenant display name, tenant ID candidate, timezone, and locale.
- Primary domain, alternate domains, and DNS ownership notes.
- Brand colors, typography preferences, logo/icon assets, and accessibility constraints.
- Required pages, slugs, navigation order, metadata, redirects, and canonical URLs.
- Page body content in package-compatible JSON.
- Media manifest with source references, alt text, captions, licensing, and desired placement.
- Form definitions, routing labels, required fields, success copy, and readback expectations.
- Public contact destination requirements without credential values in repo files.
- Admin/operator users by role, with credentials only in approved secure handoff.
- Publish target, static-site expectations, runtime checks, and launch approval sequence.
- External compatibility declarations for submit aliases, Admin FormEntry aliases, and live container expectations.

Data that must stay out of repo package files:

- Credential values.
- Provider secrets.
- Deployment tokens.
- Provider connection material.
- SAS values.
- Private owner hard-copy artifacts.
