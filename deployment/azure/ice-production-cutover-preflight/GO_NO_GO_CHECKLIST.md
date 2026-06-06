# Go/No-Go Checklist

Generated: 2026-06-06

## Current Decision

Preflight result:

```text
go for explicit cutover approval boundary
no-go for automatic production cutover
```

## Go Conditions Met

- staging default host is Ready
- staging content routes pass
- staging obsolete routes return 404
- static assets pass
- media URLs pass
- strict validators pass
- staging and production form OPTIONS pass
- production root and `www` form origins are allowed
- root and `www` current DNS records are captured
- root and `www` are currently DNS-only
- media, MX, TXT, and autodiscover records are identified
- rollback target records are documented

## Go Conditions Still Needed

- explicit production cutover execution approval
- exact Azure custom-domain validation records/tokens from approved binding workflow
- Cloudflare DNS mutation approval
- decision on `www` redirect versus canonical-only
- execution window and rollback owner
- final smoke test owner
- agreement that using `swa-ice-static-staging` for production domains is acceptable, or separate approval for a production-named SWA resource/deployment

## No-Go Conditions

Do not execute cutover if:

- Cloudflare token/zone access is unavailable during execution
- Azure custom-domain validation cannot complete
- current root/www rollback values are not captured at execution time
- media or form OPTIONS checks fail before cutover
- the team requires a production-named SWA resource but has not approved creating/deploying one
- valid form submission/email testing is required but not separately approved
- DNS, Cloudflare, or Azure changes would affect Roller
