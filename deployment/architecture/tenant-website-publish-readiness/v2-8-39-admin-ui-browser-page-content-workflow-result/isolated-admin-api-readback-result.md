# Isolated Admin API Readback Result

Admin API readbacks used the browser-login token in memory only. The token was not printed or written.

Pre-create:

- Pages read status: HTTP 200.
- Page count before proof: 0.

After UI create:

- Page read status: HTTP 200.
- Slug matched: true.
- Title matched initial title: true.
- Tenant matched: true.
- Draft state: true.
- Sitemap hidden: true.

After UI update:

- Page read status: HTTP 200.
- Updated title matched: true.
- Tenant matched: true.
- Version: 2.

After fallback rollback:

- Page read status: HTTP 200.
- Title matched initial title: true.
- Tenant matched: true.
- Version: 3.
- Final page count: 1.

Residual state:

`reverted_draft_present`
