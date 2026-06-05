# Approval Required Before Email Setup

Generated: 2026-06-05

Separate explicit approval is required before:

- creating or changing Microsoft Entra app registrations
- enabling or changing Function managed identity permissions
- granting Microsoft Graph or Exchange Online app permissions
- configuring Exchange Online RBAC for Applications
- configuring legacy Application Access Policies
- changing SMTP AUTH settings
- creating or changing mailbox delegate permissions
- creating or changing email credentials, certificates, or secrets
- creating or changing Azure Key Vault resources or references
- changing Azure Function app settings
- redeploying the Function endpoint
- sending any test email
- changing static production environment variables
- setting production email verified status
- marking contact form production readiness `yes`

## Current Explicit No-Action Confirmation

This preflight did not:

- send email
- touch Microsoft 365
- change Azure app settings
- redeploy the endpoint
- write CMS records
- write MediaAsset records
- change Cloudflare
- deploy static output
- read protected config
- touch Roller

