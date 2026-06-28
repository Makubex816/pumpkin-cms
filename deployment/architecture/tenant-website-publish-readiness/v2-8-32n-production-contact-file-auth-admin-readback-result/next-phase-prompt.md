# Next Phase Prompt

Approve V2.8.32O only: resolve the V2.8.32N `readback_auth_invalid_or_insufficient` blocker by providing an Admin FormEntry readback credential or auth mechanism that returns 2xx for:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/admin/ice-rink-rentals/form-entries`

Approved next scope:

- Read only the newly approved ephemeral auth handoff file or approved runtime value for Admin FormEntry readback auth.
- Do not print or write the auth value.
- Verify the auth handoff is ignored if it is file-based.
- Run bounded GET preflights only for the previously approved health/page/Admin readback URLs.
- Stop before POST unless authenticated Admin FormEntry readback returns 2xx.
- If authenticated Admin readback returns 2xx, submit exactly one synthetic non-PII POST to `https://iceskatingrinkrentals.com/api/static-contact`.
- Include a V2.8.32O trace ID in the message body.
- Do not retry after a sent POST.
- Poll Admin FormEntry readback up to 5 attempts over 60 seconds for the returned entry ID or trace ID.
- Create a V2.8.32O result package and root report.

Not approved:

- Deployment or redeployment.
- Azure resource mutation.
- App setting list/show/set.
- Protected config read beyond the single approved auth handoff.
- `.env.local`, appsettings, or local.settings read.
- Key Vault, keys/listKeys, connection string, or SAS generation.
- DNS/custom-domain mutation.
- Search Console/indexing action.
- Inbox/provider login.
- More than one production contact POST.
- Arbitrary outbound URL checks beyond approved URLs.

