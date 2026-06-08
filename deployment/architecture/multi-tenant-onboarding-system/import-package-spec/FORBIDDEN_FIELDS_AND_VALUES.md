# Forbidden Fields and Values

Forbidden anywhere in import packages:

- API keys
- JWTs
- passwords
- private keys
- connection strings
- Azure tokens
- Cloudflare tokens
- deployment tokens
- Microsoft Graph client secrets
- SAS URLs
- protected local config paths
- `.env.local`
- `appsettings.Development.json`
- real `local.settings.json` contents
- localhost URLs in production-ready packages
- local `/media/...` URLs in production-ready packages
- preview routes in production output
- unrelated tenant brand strings
- draft workflow/review/admin payloads in public page JSON

JSON Schema cannot catch every forbidden value. Validators must run targeted scans and contextual checks.
