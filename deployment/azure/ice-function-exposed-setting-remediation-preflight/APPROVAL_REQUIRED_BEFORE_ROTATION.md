# Approval Required Before Rotation

Generated: 2026-06-06

No storage key rotation or Function app setting update is approved by this preflight.

## Suggested Approval

```text
Approve Ice Function storage setting remediation execution only: rotate the exposed storage account key for iceforms20260605 without printing keys or connection strings, update only the existing Function app storage connection settings AzureWebJobsStorage, WEBSITE_CONTENTAZUREFILECONNECTIONSTRING, and AzureWebJobsDashboard for func-ice-static-contact-20260605, restart only if required, validate /api/static-contact in dry-run/no-email mode, and document the result. No email sending, no Microsoft 365 changes, no Graph app/RBAC changes, no CMS writes, no MediaAsset writes, no Cloudflare changes, no static deployment, no production deployment, and Roller remains paused.
```

## Still Not Approved

- storage key rotation
- app setting changes
- endpoint redeploy
- real email sending
- Microsoft 365 changes
- Graph app/RBAC changes
- CMS writes
- MediaAsset writes
- Cloudflare changes
- static deployment
- production deployment
- Roller work

