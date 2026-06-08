# Support Packet JSON Expectations

`support-packet.json` is a redacted troubleshooting bundle.

Required:

- `schemaVersion`
- `tenantId`
- `siteKey`
- `issueSummary`
- `currentGate`
- `publicUrls`
- `validationReports`
- `ownerContacts`
- `redaction`

Allowed content:

- public URLs
- HTTP status codes
- route names
- validation result paths
- redacted environment presence checks
- owner role/contact labels

Forbidden content:

- passwords
- API keys
- JWTs
- Azure tokens
- Cloudflare tokens
- Microsoft Graph secrets
- connection strings
- deployment tokens
- mailbox contents
- protected config
