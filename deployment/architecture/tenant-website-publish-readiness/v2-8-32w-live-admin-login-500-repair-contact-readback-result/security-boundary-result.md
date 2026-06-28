# Security Boundary Result

Approved mutations performed:

- Set `Jwt__Issuer`.
- Set `Jwt__Audience`.
- Set `Jwt__ExpirationMinutes`.
- Restarted the existing Pumpkin API Web App once.

Mutations not performed:

- No Azure resource creation or deletion.
- No provider/contact/database secret mutation.
- No Admin identity mutation.
- No source hotfix.
- No publish/deploy.
- No DNS/custom-domain mutation.
- No Search Console/indexing action.
- No production contact POST.

Config and secret boundary:

- No appsettings list/show command was run.
- No Key Vault secret query was run.
- No keys/listKeys command was run.
- No SAS generation occurred.
- No connection string generation occurred.
- No protected live/local config values were printed or written.
- A source search surfaced repo-local `appsettings.*.json.example` matches; no live/protected local appsettings file or secret value was opened or written.

Staging boundary:

- No files were staged during V2.8.32W.
- `.tmp/` remains ignored.
