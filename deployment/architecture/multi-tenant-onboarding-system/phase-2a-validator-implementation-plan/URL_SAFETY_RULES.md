# URL Safety Rules

URL safety must be field-context aware. JSON Schema `format: uri` is not enough.

## Always Forbidden

Reject in package content:

- `localhost`
- `127.0.0.1`
- private loopback names
- `file://`
- Windows absolute paths
- protected config paths
- `.env` paths
- `appsettings.Development.json`
- real `local.settings.json` paths
- query strings containing secret-like names
- credentials embedded in URL userinfo, such as `https://user:pass@example.com`
- SAS-like query parameters
- access tokens in query strings

## Production Field Rules

For production-facing fields:

- no staging/default-host URLs in canonical or sitemap fields
- no local `/media/...` production media URLs
- canonical URLs must use the declared canonical host
- media URLs must use `site.json.mediaDomain`
- form endpoint URLs must match deployment profile allowed endpoint policy
- Cloudflare/Azure URLs are allowed only in profile-specific infrastructure fields or documented origin fields, not public canonical URLs

## Allowed URL Contexts

| Context | Allowed shape |
| --- | --- |
| canonical URL | `https://{primaryDomain}/...` or `https://{wwwDomain}/...` per canonical policy |
| media public URL | `https://{mediaDomain}/...` |
| staging hostname | hostname or URL only in staging fields |
| Cloudflare zone name | domain-like identifier only, no tokens |
| Azure resource prefix | name prefix only, not portal URL or token |
| Search Console property | metadata string only, no action |

## Query Secret Detectors

Flag URL query parameters such as:

- `sig`
- `signature`
- `token`
- `access_token`
- `api_key`
- `apikey`
- `client_secret`
- `code`
- `se`
- `sp`
- `sv`

Do not print the full URL when a secret-like query is found. Print file path, field pointer, detector code, and redacted host/path.

