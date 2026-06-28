# Next Phase Prompt

Approve V2.8.32R only: resolve the V2.8.32Q `live_admin_login_failed_http_500` blocker after `Jwt__SecretKey` binding succeeded and Pumpkin API health passed.

Approved next scope:

- Review V2.8.32Q result package.
- Do not deploy.
- Do not list/show appsettings.
- Do not read protected config except a newly approved secure handoff file.
- Either provide a saved JWT that returns 2xx for Admin FormEntry readback, or approve binding the exact source-referenced JWT support settings needed for login.
- If binding more JWT settings is approved, set only explicitly approved `Jwt__*` settings on `app-pumpkin-api-prod-centralus-001`.
- Do not set provider/contact/database secrets.
- Restart the Web App only if required.
- Verify Pumpkin API `/health` and `/api/health`.
- Run `POST /api/auth/login` with secure-file admin credentials in memory only.
- Do not print or write password, token, cookie, or JWT secret values.
- Preflight `GET /api/admin/ice-rink-rentals/form-entries` with `Authorization: Bearer <token>`.
- Stop before POST unless authenticated readback returns 2xx.
- If authenticated readback returns 2xx, submit exactly one synthetic non-PII POST to `https://iceskatingrinkrentals.com/api/static-contact`.
- Include a V2.8.32R trace ID in the message body.
- Do not retry after a sent POST.
- Poll Admin FormEntry readback up to 5 attempts over 60 seconds for returned entry ID or trace ID.
- Create a V2.8.32R result package and root report.

Not approved without explicit inclusion:

- Deployment or redeployment.
- Azure resource creation/deletion.
- Provider/contact/database secret appsetting mutation.
- Appsettings list/show.
- Key Vault, keys/listKeys, connection string, or SAS generation.
- DNS/custom-domain mutation.
- Search Console/indexing action.
- Inbox/provider login.
- More than one production contact POST.

