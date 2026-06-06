# Remediation Scope

Generated: 2026-06-06

## Approved And Performed

- identified the currently referenced storage key by in-memory comparison only
- updated only the approved Function App storage setting names
- validated `/api/static-contact` in dry-run/no-email mode
- rotated only the previously referenced/exposed storage account key
- validated `/api/static-contact` again after rotation
- documented the result

## Approved Setting Names

- `AzureWebJobsStorage`
- `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING`
- `AzureWebJobsDashboard`

## Not Performed

- no real email sending
- no Microsoft 365 changes
- no Graph app/RBAC changes
- no client secret creation
- no certificate creation
- no endpoint code redeployment
- no CMS writes
- no MediaAsset writes
- no Cloudflare changes
- no static site deployment
- no production deployment
- no root/www DNS changes
- no Roller work

