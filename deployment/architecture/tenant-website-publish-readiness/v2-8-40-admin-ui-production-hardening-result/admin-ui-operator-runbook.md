# Admin UI Operator Runbook

## Purpose

This runbook covers the live Pumpkin CMS Admin UI default hosts for tenant operations and production-readiness checks.

## Hosts

- Isolated Admin UI: `https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net`
- Production Admin UI: `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net`
- Pumpkin API: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`

## Login Flow

1. Open the Admin UI host.
2. Use the approved operator credential source.
3. Confirm the dashboard loads.
4. Confirm the selected tenant context is `ice-rink-rentals`.
5. Use Logout when done and confirm protected routes return to login.

Do not store credentials in repo files or screenshots.

## No-Localhost Verification

Use browser dev tools or the approved no-write proof runner pattern to confirm Admin UI API calls go to the live Pumpkin API host and not to localhost.

Expected live read paths during no-write checks include auth, tenant reads, and page list reads.

## Page/Content Readiness Check

For Pages:

- Open Dashboard, then Pages.
- Confirm tenant context is visible.
- Review counts and published/draft/sitemap badges.
- Do not create, update, import, publish, unpublish, duplicate, delete, or repair records unless a separate write phase explicitly approves it.

## Hardening Checks

- `/robots.txt` returns disallow-all.
- Login page has noindex/noarchive protection.
- Security headers are present.
- Static assets load without failures.
- Logout clears session state.

## Troubleshooting

- If login fails, verify Pumpkin API health and auth status without printing secrets.
- If tenant context is missing, refresh once and confirm the operator account tenant.
- If pages fail to load, check for live API 401/403/5xx statuses.
- If localhost requests appear on a production host, treat as a hard stop and repair Admin UI runtime binding before further proof.
- If static assets fail after header changes, roll back brittle header changes and re-prove before production.

## Exclusions

Theme/Form authoring, media upload, contact submission, tenant mutation, DNS/custom-domain mutation, and indexing tooling are outside this runbook unless a later phase explicitly approves them.

