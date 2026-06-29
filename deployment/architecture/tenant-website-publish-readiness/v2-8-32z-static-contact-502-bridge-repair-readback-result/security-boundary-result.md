# Security Boundary Result

Approved mutations performed:

- Set only `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` on the approved Static Web App to the secure normalized value.
- Sent exactly one corrected synthetic non-PII production contact POST.

Mutations not performed:

- No broad deploy or redeploy.
- No Azure resource creation or deletion.
- No appsettings list/show.
- No unrelated appsetting mutation.
- No direct Cosmos mutation.
- No tenant API key record alignment.
- No DNS/custom-domain mutation.
- No Search Console/indexing action.
- No inbox/provider login.

Config and secret boundary:

- No protected config file was read except the approved V2.8.32Z secure file.
- No Key Vault secret query was run.
- No keys/listKeys command was run.
- No SAS generation occurred.
- No connection string generation occurred.
- No protected live/local config values were printed or written.

Staging boundary:

- No files were staged during V2.8.32Z.
- `.tmp/` remains ignored.
