# Setup Scope

Generated: 2026-06-05
Updated: 2026-06-06

## Approved And Performed

- used the existing Ice Static Contact Form Mailer app registration
- checked `Get-OrganizationConfig`
- ran `Enable-OrganizationCustomization` because `IsDehydrated` was `true`
- verified `IsDehydrated=false` after customization
- connected to Exchange Online
- reused the existing Exchange service-principal pointer
- configured the mailbox-only Exchange Online RBAC for Applications scope for `contact@iceskatingrinkrentals.com`
- assigned `Application Mail.Send` to the Ice app for that scope
- verified `Test-ServicePrincipalAuthorization` reports `InScope=True` for the contact mailbox
- granted/admin-confirmed Microsoft Graph `Mail.Send` application consent only after mailbox scoping succeeded
- updated reports/docs

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
- Roller work

## Boundary Decision

Microsoft documents Exchange RBAC for Applications permissions and Microsoft Entra permissions as additive. This pass therefore created and verified the Exchange mailbox scope before granting the existing Microsoft Graph `Mail.Send` application consent.

No broader Graph permissions were added.
