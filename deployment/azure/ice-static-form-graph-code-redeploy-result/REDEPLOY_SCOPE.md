# Redeploy Scope

Generated: 2026-06-05

## Approved

- redeploy the existing Function App code package
- use the existing Function App `func-ice-static-contact-20260605`
- keep endpoint in dry-run/no-email mode
- validate `/api/static-contact` over HTTPS with safe test payloads
- update reports/docs

## Not Approved And Not Performed

- real email sending
- Microsoft 365 changes
- Graph app registration creation
- Graph permission grants
- Exchange Online RBAC changes
- Azure app setting changes to Graph mode
- production email credential configuration
- CMS writes
- MediaAsset writes
- Cloudflare changes
- static deployment
- production deployment
- root/www DNS changes
- protected config reads
- Roller work
- printing secrets, keys, tokens, connection strings, client secrets, or credentials

## Deployment Target

```text
Resource group: rg-ice-static-form-endpoint
Function App: func-ice-static-contact-20260605
Route: /api/static-contact
```

