# Discovery Scope

## Allowed In This Phase

- Safe repo source and committed documentation review.
- Provider configuration name discovery without values.
- Presence-only environment checks.
- Azure CLI read-only subscription/resource discovery.
- GET-only CMS/API reachability checks with response bodies suppressed.
- Result package and root report creation.

## Not Allowed In This Phase

- Database export or import.
- Cosmos document export.
- Blob/media download.
- Storage key/listKeys commands.
- SAS generation.
- Protected config reads.
- Secret printing or export.
- CMS writes or MediaAsset writes.
- Azure mutation.
- Cloudflare, DNS, deployment, email, Search Console, indexing, or live-page publication actions.

## Protected Files Not Read

The discovery did not read `.env.local`, `appsettings.Development.json`, `local.settings.json`, credential/cache files, uploaded env/key text files, or any protected config containing keys, JWTs, cookies, auth headers, connection strings, storage keys, or SAS URLs.
