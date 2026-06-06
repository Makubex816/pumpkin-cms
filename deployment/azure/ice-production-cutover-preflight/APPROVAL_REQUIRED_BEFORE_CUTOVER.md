# Approval Required Before Cutover

Generated: 2026-06-06

## Current Boundary

This preflight did not approve or perform:

- DNS changes
- Cloudflare mutations
- Azure custom-domain binding
- production deployment
- CMS writes
- MediaAsset writes
- Function App setting changes
- endpoint redeployment
- valid form submission
- email sending
- Microsoft 365 changes
- protected config reads
- Roller work

## Future Approval Must Explicitly Include

For production root/www cutover, the next approval must state whether Codex may:

- bind `iceskatingrinkrentals.com` to `swa-ice-static-staging`
- bind `www.iceskatingrinkrentals.com` to `swa-ice-static-staging`
- add Azure-required Cloudflare validation records
- update root DNS record from `66.81.203.198` to the Azure Static Web Apps target
- update `www` DNS record from `66.81.203.198` to the Azure Static Web Apps target
- add or defer a `www` to apex redirect
- run public production smoke tests
- run safe form OPTIONS checks

## Still Separate Unless Explicitly Approved

- valid contact form submission
- email delivery testing
- Microsoft 365 changes
- Function settings
- endpoint redeploy
- CMS writes
- MediaAsset writes
- static artifact deployment
- production-named Azure resource creation
- Cloudflare cache rules beyond the approved DNS/redirect scope
- Roller work
