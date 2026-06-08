# Test Plan

## Fixture Personas

- low-skill business owner
- content editor
- technical operator
- legal/privacy reviewer
- form owner

## Test Areas

| Area | Test |
| --- | --- |
| Low-skill flow | User can complete required fields using helper text without editing JSON. |
| Valid package generation | Complete draft generates all required package files with deterministic IDs. |
| Invalid package generation | Bad routes, missing owners, and unsafe URLs are caught before export. |
| Save/resume | User can save, close, resume, and continue at first incomplete step. |
| Conflict handling | Concurrent edits produce a conflict summary, not silent overwrite. |
| Package export | Export writes local files only and shows diff preview before overwrite. |
| Validator integration | Full validator runs before export and findings map to screens. |
| Support packet | Failed and passed drafts can export redacted support packets. |
| Secret handling | Secret-like values are rejected, redacted, not saved, and not logged. |
| Role restrictions | Roles can edit only allowed screens and cannot bypass hard stops. |
| Audit logging | Field changes, validation runs, exports, and approvals are logged safely. |
| Search Console hard stop | Indexing owner can be recorded, but no indexing action exists. |
| No external mutation | Tests confirm no CMS/Azure/Cloudflare/DNS/deployment/email/external calls. |

## Acceptance Test Fixtures

- minimal valid package with home/contact pages
- package with missing page for approved route
- package with unknown media reference
- package with unknown form reference
- package with local/staging URL
- package with secret-like value
- package with missing legal/privacy owner
- package with indexing requested too early

## Non-Functional Tests

- generated JSON is stable across repeated runs
- generated JSON parses
- generated package passes validator when inputs are valid
- support packet excludes raw package files by default
- audit logs contain no secrets
