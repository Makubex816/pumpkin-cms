# API Admin Security Boundaries

Security rules for future implementation:

- Authenticate every admin endpoint.
- Authorize tenant/site access before loading data.
- Enforce role permissions before planning actions.
- Enforce mode gates before any write.
- Partition persisted records by tenant key.
- Reject mixed-tenant bulk actions.
- Require reason text for disabling, blocking, archiving, policy edits, and bulk execution.
- Use ETags or equivalent optimistic concurrency for writes.
- Rate-limit scan runs and bulk previews.
- Do not crawl external outbound URLs.
- Do not perform live HTTP checks unless separately approved.
- Do not log bearer credentials, cookies, auth headers, protected config, connection strings, SAS URLs, storage keys, private keys, or raw environment values.
- Redact request and response logs.
- Keep Backup Center and restore validation gates in the write path.
- Treat renderer integration as a separate production gate.

Admin UI security rules:

- Hide or disable write controls in read-only modes.
- Show tenant/site scope on every screen.
- Avoid cross-tenant search unless explicitly authorized.
- Show warnings when a link would render differently under the active policy.
- Never display protected operational values.

