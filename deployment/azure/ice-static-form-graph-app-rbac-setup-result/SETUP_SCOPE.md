# Setup Scope

Generated: 2026-06-05
Updated: 2026-06-06

## Approved

- use the existing Ice Static Contact Form Mailer app registration
- grant/admin-confirm Microsoft Graph `Mail.Send` application consent only if safe
- install/import ExchangeOnlineManagement for CurrentUser only if needed
- connect to Exchange Online if required and safe
- configure the narrowest available Exchange Online RBAC for Applications mailbox scope for `contact@iceskatingrinkrentals.com`
- update reports/docs

## Not Approved And Not Performed

- client secret creation
- certificate creation
- real email sending
- Azure Function app setting changes
- endpoint redeployment
- production test submissions
- CMS writes
- MediaAsset writes
- Cloudflare changes
- static deployment
- production deployment
- root/www DNS changes
- protected config reads
- Roller work
- printing secrets, keys, tokens, connection strings, client secrets, or credentials

## Boundary Decision

Microsoft documents Exchange RBAC for Applications permissions and Microsoft Entra permissions as additive. Because the required final intent is mailbox-only access, broad Entra admin consent for `Mail.Send` was not granted.

Exchange RBAC configuration was attempted but stopped at the `Enable-OrganizationCustomization` prerequisite returned by Exchange Online. That tenant-level command was not approved in this pass.

