# Setup Scope

Generated: 2026-06-05

## Approved

- create/configure Ice-specific Microsoft Entra app registration
- add Microsoft Graph `Mail.Send` application permission if safe
- grant/admin-confirm consent only if active identity and mailbox scoping allow a safe result
- scope the app to `contact@iceskatingrinkrentals.com` using Exchange Online RBAC for Applications, or document exact blocker
- update reports/docs

## Not Approved And Not Performed

- client secret creation
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

Admin consent was not granted because Exchange Online RBAC scoping could not be completed in this environment. This avoids creating broad unscoped `Mail.Send` capability.

