# No-Secret Email Guardrails

Email readiness files must contain placeholder refs and public planning notes only.

## Never Commit

- SMTP passwords
- Email provider passwords
- Mailbox passwords
- App passwords
- OAuth client secrets
- Microsoft tenant secrets
- Microsoft 365 client secrets
- Microsoft Graph access tokens
- Microsoft Graph refresh tokens
- Provider API tokens
- DKIM private keys
- Certificate private keys
- Email provider recovery codes
- Azure tokens
- Cloudflare tokens
- Storage keys
- Connection strings
- `.env.local`
- `appsettings.Development.json`
- Active `.github/workflows` files for deployment/email automation unless explicitly approved later

## Commit Only

- Provider keys
- Provider types
- Capability names
- Placeholder refs such as `ICE_RINK_RENTALS_SMTP_PASSWORD_REF`
- Microsoft placeholder refs such as `MICROSOFT_365_CLIENT_SECRET_REF` and `MICROSOFT_365_SMTP_PASSWORD_REF`
- DNS checklist record refs
- Draft templates with allowed variables
- Dry-run-only SMTP and Graph configuration
- Safe migration notes

## Targeted Email Secret Patterns

Use these names as blocked value patterns when scanning changed files:

- `SMTP_PASSWORD`
- `EMAIL_PASSWORD`
- `DKIM_PRIVATE_KEY`
- `SENDGRID_API_KEY`
- `MAILGUN_API_KEY`
- `POSTMARK_API_TOKEN`
- `PURELYMAIL_PASSWORD`
- `GOOGLE_APP_PASSWORD`
- `MXROUTE_PASSWORD`
- `MIGADU_PASSWORD`
- `MAILCOW_API_KEY`
- `MICROSOFT_365_CLIENT_SECRET`
- `MICROSOFT_365_SMTP_PASSWORD`
- `MICROSOFT_365_REFRESH_TOKEN`
- `MICROSOFT_365_ACCESS_TOKEN`
- `MICROSOFT_GRAPH_ACCESS_TOKEN`
- `MICROSOFT_GRAPH_REFRESH_TOKEN`
- `AZURE_CLIENT_SECRET`
- `OAUTH_CLIENT_SECRET`
- `CERTIFICATE_PRIVATE_KEY`

Pattern names may appear in guardrail docs and validator code. Values must not.

The Microsoft 365 verification TXT value `MS=ms13281863` is not a credential and may be documented as a public DNS setup value.

## Validator Behavior

`validate-email-readiness-fixtures.mjs` blocks:

- literal values in fields ending in `Ref`
- secret-like assignments in provider config
- private key markers
- bearer-token-like strings
- mailbox addresses outside the manifest domain
- unsupported provider types/statuses/capabilities
- unsupported template variables
- SMTP config where sending is enabled outside dry-run mode
- Microsoft 365 app-sending config that uses literal client secret, tenant secret, access token, refresh token, SMTP password, app password, certificate private key, or DKIM private key values

The validator is offline and does not query DNS, connect to SMTP, call provider APIs, create Microsoft 365 resources, or send email.

## Protected Config Rules

Do not read or modify:

- `.env.local`
- `appsettings.Development.json`

Do not print:

- secrets
- API keys
- JWTs
- Azure tokens
- Cloudflare tokens
- Microsoft credentials
- tenant secrets
- storage keys
- SMTP passwords
- email provider passwords
- app passwords
- OAuth client secrets
- refresh tokens
- access tokens
- certificate private keys
- DKIM private keys
- connection strings
