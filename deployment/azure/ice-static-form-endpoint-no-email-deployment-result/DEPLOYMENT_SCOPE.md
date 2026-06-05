# Deployment Scope

Generated: 2026-06-05

## Approved

- create or configure only Azure resources needed for the Ice `/api/static-contact` Function endpoint
- deploy the scaffolded endpoint in no-email/mock verification mode
- validate HTTPS endpoint behavior with safe test payloads
- document the endpoint URL and verification result
- update reports/docs

## Not Approved

- real email sending
- Microsoft 365 changes
- production email provider configuration
- CMS writes
- MediaAsset writes
- Cloudflare changes
- static site deployment
- production deployment
- root/www DNS changes
- setting `STATIC_FORM_ENDPOINT_VERIFIED=true` in repo or static build config
- Roller work
- printing secrets, keys, tokens, connection strings, or credentials

## Boundary Result

No real email was sent. No Microsoft 365 settings were touched. No CMS or MediaAsset records were written. No Cloudflare changes were made. No static site was deployed. No production website artifacts were deployed. No root/www DNS changes were made. Roller remains paused.
