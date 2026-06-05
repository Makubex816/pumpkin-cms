# Static Form Endpoint Deployment Instructions

These are future instructions only. No endpoint was deployed by this package update.

## Future Deployment Shape

Primary public endpoint:

```text
https://<approved-form-endpoint-host>/api/static-contact
```

Deployable scaffold route:

```text
Function name: static-contact
Azure Functions route: static-contact
Host route prefix: api
Public path: /api/static-contact
```

The current deployable scaffold does not register a deployed `/api/contact` compatibility route. The local test server keeps `/api/contact` as a local-only compatibility path for older sample commands. Deployed `/api/contact` compatibility would require separate approval and tests.

## Future Steps After Explicit Approval

1. Confirm the endpoint host and route.
2. Keep the first Ice execution scoped to `ice-rink-rentals`.
3. Configure allowed origins only for approved Ice hosts.
4. Configure server-side Pumpkin API settings in approved secret storage only.
5. Install package dependencies in the approved build environment.
6. Run `npm run check`, `npm test`, and `npm run test:wrapper` locally.
7. Deploy or configure the endpoint only after approval.
8. Submit approved test-only payloads.
9. Verify `FormEntry` persistence through the approved backend path.
10. Confirm no secrets appear in responses, logs, or static output.
11. Keep email notifications disabled unless separately approved.
12. Keep `FORM_DELIVERY_MODE=dry-run` unless Graph/Microsoft 365 email delivery has separate approval.
13. Set `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` for static build only after the public endpoint URL is real.
14. Set `STATIC_FORM_ENDPOINT_VERIFIED=true` only after the approved endpoint verification context passes.
15. Rerun Ice static export and strict validators.

## Required Future Settings

Frontend/static build:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://<approved-form-endpoint-host>/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Endpoint runtime app settings:

```text
PUMPKIN_API_URL=<approved Pumpkin API URL>
ICE_RINK_RENTALS_API_KEY=<server-side secret>
STATIC_FORM_ALLOWED_ORIGINS=https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com
STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals
FORM_DELIVERY_MODE=dry-run
STATIC_FORM_FORWARD_MODE=pumpkin-api
STATIC_FORM_MAX_BODY_BYTES=20000
STATIC_FORM_MAX_MESSAGE_LENGTH=4000
STATIC_FORM_RATE_LIMIT_MODE=<approved mode>
STATIC_FORM_SPAM_PROTECTION_MODE=<approved mode>
ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY=ice-rink-rentals-default
```

Endpoint runtime app settings for future approved Graph mode, placeholders only:

```text
FORM_DELIVERY_MODE=graph
MICROSOFT_GRAPH_TENANT_ID=<Microsoft tenant id>
MICROSOFT_GRAPH_CLIENT_ID=<Microsoft Graph app client id>
MICROSOFT_GRAPH_CLIENT_SECRET -> <Key Vault reference or approved server-side secret>
MICROSOFT_GRAPH_SENDER_USER=contact@iceskatingrinkrentals.com
ICE_RINK_RENTALS_LEAD_RECIPIENT=<approved recipient mailbox or distribution group>
MICROSOFT_GRAPH_SAVE_TO_SENT_ITEMS=false
FORM_EMAIL_REPLY_TO_MODE=<none|submitter-email|static>
FORM_EMAIL_REPLY_TO_ADDRESS=<approved static reply-to mailbox>
FORM_EMAIL_SUBJECT_PREFIX=<approved subject prefix>
```

Do not put Pumpkin API keys, email credentials, connection strings, tokens, or provider secrets in frontend/static build settings.

## Local No-Email Test Commands

Wrapper and handler tests run with mocked or dry-run behavior only:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
npm run check
npm test
npm run test:wrapper
npm run test:graph
```

Local server dry-run:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
$env:STATIC_FORM_FORWARD_MODE='dry-run'
npm run start:local
```

Then submit to the primary local route:

```powershell
Invoke-WebRequest `
  -Uri 'http://localhost:7072/api/static-contact' `
  -Method POST `
  -ContentType 'application/json' `
  -Headers @{ Origin = 'http://localhost:3002' } `
  -InFile 'sample-request.json'
```

## Packaging Notes

The deployable scaffold includes:

- `package.json` with `main=azure-function-static-contact.mjs`
- `azure-function-static-contact.mjs`
- `azure-function-adapter.mjs`
- `contact-handler.mjs`
- validation and sanitization helpers
- Graph sendMail delivery adapter
- `host.json`
- `.funcignore`
- `local.settings.sample.json` with placeholders only

Do not commit or publish a real `local.settings.json`.

Future package/publish command shape, documentation only:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
npm install
npm run check
npm test
func azure functionapp publish <approved-function-app-name>
```

The publish command above was not run in this pass.

## Future Verification Criteria

Before `STATIC_FORM_ENDPOINT_VERIFIED=true` may be set:

- `OPTIONS https://<approved-form-endpoint-host>/api/static-contact` returns approved CORS headers
- current frontend alias payload succeeds
- legacy payload succeeds through the primary route
- invalid email is rejected
- unknown routing and recipient refs are rejected without echoing submitted values
- oversized message is rejected
- honeypot is rejected
- no secrets appear in public responses or logs
- approved no-email backend persistence verification passes

Before production email readiness may be considered, future approved Graph verification must also prove:

- Microsoft 365 app or managed identity setup is complete
- Exchange Online RBAC for Applications or approved mailbox scope is configured
- Graph mode is deployed with server-side settings only
- exactly one approved live test email is received at the approved recipient
- invalid payloads still reject without sending email
- public responses remain generic and secret-free

## Approval Boundaries

Separate explicit approval is required before:

- endpoint deployment
- Azure resource creation
- Azure Function deployment
- production environment variable changes
- setting `STATIC_FORM_ENDPOINT_VERIFIED=true`
- sending email
- Microsoft 365 changes
- Microsoft Graph app registration or permission grants
- Exchange Online RBAC changes
- Azure Function app setting changes
- Cloudflare or DNS changes
- CMS writes
- MediaAsset writes
- static site deployment
- Roller work
