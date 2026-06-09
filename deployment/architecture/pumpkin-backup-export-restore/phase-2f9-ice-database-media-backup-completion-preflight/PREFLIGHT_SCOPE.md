# Preflight Scope

## Approved

- Review safe Phase 2F-8 baseline reports and Backup Center architecture docs.
- Define database backup/export artifact options.
- Define media blob copy/download options.
- Define env/tooling presence checks without values.
- Define output, storage, encryption, checksum, manifest, validator, and restore validation rules.
- Create docs and reports only.

## Not Approved

- Database export or import.
- SQL BACPAC creation.
- Reading database connection strings.
- Reading protected config files.
- Blob listing, copying, or downloading.
- Azure storage mutation.
- Azure SQL mutation.
- CMS/API calls.
- CMS writes.
- MediaAsset writes.
- Secret export.
- Encrypted escrow payload creation.
- Restore into any real system.
- Azure, Cloudflare, DNS, deployment, Function App setting, email, Microsoft 365, Search Console, indexing, or live-page publication actions.

## Protected Inputs

The preflight does not read or modify:

- `.env.local`;
- `appsettings.Development.json`;
- `local.settings.json` if it contains real secrets;
- credential/cache files;
- uploaded env/key text files;
- files containing API keys, JWTs, auth headers, cookies, tokens, connection strings, storage keys, or SAS URLs.

