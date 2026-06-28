# Next Phase Prompt

Approve V2.8.32P only: resolve the V2.8.32O `secure_file_missing_required_admin_jwt_secret_value` blocker by providing a corrected ignored secure handoff file that includes a non-empty `adminJwtSecretValue` for the source-discovered `Jwt__SecretKey` setting.

Approved next scope:

- Verify the corrected secure file exists and is git-ignored.
- Read only the corrected secure file.
- Do not print or write `adminPassword`, `adminJwtSecretValue`, returned token, or cookie.
- Use the source-discovered Admin/JWT app setting name `Jwt__SecretKey`.
- Run `az account set --subscription ff887def-fd83-4a19-9298-13d4b1687873`.
- Run `az account show` and stop if the active subscription ID does not match.
- Set only `Jwt__SecretKey` on `app-pumpkin-api-prod-centralus-001`.
- Do not set provider/contact/database secrets.
- Do not list/show appsettings.
- Restart the Web App only if required.
- Verify Pumpkin API `/health` and `/api/health`.
- Log in with `POST /api/auth/login` using secure-file admin credentials in memory only.
- Use returned auth only in memory.
- Preflight `GET /api/admin/ice-rink-rentals/form-entries` with `Authorization: Bearer <token>`.
- Stop before POST unless authenticated readback returns 2xx.
- If authenticated readback returns 2xx, submit exactly one synthetic non-PII POST to `https://iceskatingrinkrentals.com/api/static-contact`.
- Include a V2.8.32P trace ID in the message body.
- Do not retry after a sent POST.
- Poll Admin FormEntry readback up to 5 attempts over 60 seconds for returned entry ID or trace ID.
- Create a V2.8.32P result package and root report.

Not approved:

- Deployment or redeployment.
- Azure resource creation/deletion.
- Provider/contact/database secret appsetting mutation.
- Appsettings list/show.
- Protected config read beyond the single approved secure file.
- `.env.local`, appsettings, or local.settings read.
- Key Vault, keys/listKeys, connection string, or SAS generation.
- DNS/custom-domain mutation.
- Search Console/indexing action.
- Inbox/provider login.
- More than one production contact POST.
- Arbitrary outbound URL checks beyond approved URLs.

