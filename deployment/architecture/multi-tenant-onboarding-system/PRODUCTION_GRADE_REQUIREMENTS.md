# Production-Grade Requirements

## Functional Requirements

- Each tenant has a unique tenant ID, site key, display name, domain set, approved routes, and deployment profile.
- Import packages are schema-versioned and validator-gated before import.
- Route allowlists are mandatory.
- Forbidden routes and paused/related tenants are recorded.
- Media URLs must use approved production URL patterns before production.
- Contact forms must declare recipients, mailbox owner, delivery mode, consent/notice status, and rollback.
- Search Console/indexing is a final gate only.

## Operational Requirements

- Every external mutation has an approval record and rollback note.
- Operators can produce a redacted support packet.
- Validators produce non-technical error messages and machine-readable reports.
- Generated artifacts and raw content-review inputs are not staged by default.
- Secrets are never stored in import packages or docs.

## Quality Requirements

- No hidden draft/review/admin payloads in public output.
- No local media paths, localhost URLs, staging hostnames, or secret-bearing URLs in production output.
- Sitemap and canonical URLs align.
- Approved routes return 200; forbidden/obsolete routes return 404 or approved redirects.
- Accessibility and privacy review status is captured before indexing.

