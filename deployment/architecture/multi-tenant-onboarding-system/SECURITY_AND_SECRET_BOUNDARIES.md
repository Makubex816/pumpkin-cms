# Security and Secret Boundaries

## Secret Handling

Never store or paste these in docs, chat, git, import packages, support packets, screenshots, or examples:

- tenant API keys
- admin JWTs
- Azure tokens
- Cloudflare tokens
- deployment tokens
- Microsoft Graph client secrets
- connection strings
- storage keys
- SAS URLs
- passwords
- private keys

Use placeholders such as `TENANT_API_KEY_RUNTIME_ONLY` and mark them as runtime-only.

## Protected Files

Do not read or modify protected config such as `.env.local`, `appsettings.Development.json`, real `local.settings.json`, credential caches, token files, or files obviously containing secrets.

## Runtime Boundary

Secrets belong in approved runtime secret stores, local operator shells, or platform app settings. Docs and import packages can name required variables, but must not include values.

## Support Packet Boundary

Support packets may include file names, schema errors, route lists, public URLs, HTTP statuses, and redacted environment-presence checks. They must not include secret values, mailbox contents, raw tokens, or protected config.

## Extension Boundary

Extensions are not arbitrary code drops. They must be reviewed, schema-validated, permission-scoped, tenant-scoped, test-gated, and rollback-ready before enablement.

