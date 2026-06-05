# Scaffold Scope

Generated: 2026-06-05

## Approved

- create or update deployable Azure Function wrapper/scaffold files
- align the primary route to `/api/static-contact`
- keep the hardened handler and validation/sanitization pipeline
- add local no-email tests
- update packaging/deployment docs
- prepare the next deployment approval package

## Not Approved

- endpoint deployment
- Azure resource creation
- Azure Function App creation
- Azure Function deployment
- production environment variable changes
- email sending
- Microsoft 365 changes
- CMS writes
- MediaAsset writes
- Cloudflare changes
- static deployment
- production deployment
- DNS changes
- protected config reads
- Roller work

## Files Changed In The Endpoint Package

Added:

- `azure-function-adapter.mjs`
- `azure-function-static-contact.mjs`
- `host.json`
- `local.settings.sample.json`
- `.funcignore`
- `test-azure-function-wrapper.mjs`

Updated:

- `azure-function-contact.example.ts`
- `local-test-server.mjs`
- `package.json`
- `README.md`
- `DEPLOYMENT_INSTRUCTIONS.md`

The existing hardened handler, validation, sanitization, and handler tests remain in place.
