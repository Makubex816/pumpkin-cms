# Next Phase Prompt

Approve V2.8.32Q only: resolve the V2.8.32P `saved_jwt_invalid_and_admin_jwt_secret_value_missing` blocker by providing either a fresh saved JWT secure file that returns 2xx for Admin FormEntry readback or a corrected binding secure file containing a non-empty `adminJwtSecretValue` for `Jwt__SecretKey`.

Approved next scope:

- Verify the new V2.8.32Q secure file exists and is git-ignored.
- Read only the approved V2.8.32Q secure file.
- If saved JWT is provided, test it first against `GET /api/admin/ice-rink-rentals/form-entries`.
- If saved JWT returns 2xx, skip Azure appsetting mutation.
- If saved JWT is absent or invalid, use the corrected binding file.
- For binding, run `az account set --subscription ff887def-fd83-4a19-9298-13d4b1687873`.
- Run `az account show` and stop if the active subscription ID does not match.
- Set only `Jwt__SecretKey` on `app-pumpkin-api-prod-centralus-001` using the secure-file value.
- Do not set provider/contact/database secrets.
- Do not list/show appsettings.
- Restart the Web App only if required.
- Verify Pumpkin API `/health` and `/api/health` after auth path resolution.
- If binding path is used, log in to `POST /api/auth/login` with secure-file admin credentials in memory only.
- Use returned auth only in memory.
- Preflight `GET /api/admin/ice-rink-rentals/form-entries` with `Authorization: Bearer <token>`.
- Stop before POST unless authenticated readback returns 2xx.
- If authenticated readback returns 2xx, submit exactly one synthetic non-PII POST to `https://iceskatingrinkrentals.com/api/static-contact`.
- Include a V2.8.32Q trace ID in the message body.
- Do not retry after a sent POST.
- Poll Admin FormEntry readback up to 5 attempts over 60 seconds for returned entry ID or trace ID.
- Create a V2.8.32Q result package and root report.

Not approved:

- Deployment or redeployment.
- Azure resource creation/deletion.
- Provider/contact/database secret appsetting mutation.
- Appsettings list/show.
- Protected config read beyond the approved secure file.
- `.env.local`, appsettings, or local.settings read.
- Key Vault, keys/listKeys, connection string, or SAS generation.
- DNS/custom-domain mutation.
- Search Console/indexing action.
- Inbox/provider login.
- More than one production contact POST.
- Arbitrary outbound URL checks beyond approved URLs.

