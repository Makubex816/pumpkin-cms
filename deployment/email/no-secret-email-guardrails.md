# No-Secret Email Guardrails

Email readiness files must contain placeholder refs and public planning notes only.

## Never Commit

- SMTP passwords
- Email provider passwords
- Mailbox passwords
- App passwords
- OAuth client secrets
- Provider API tokens
- DKIM private keys
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
- DNS checklist record refs
- Draft templates with allowed variables
- Dry-run-only SMTP configuration
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

Pattern names may appear in guardrail docs and validator code. Values must not.

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

The validator is offline and does not query DNS, connect to SMTP, call provider APIs, or send email.

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
- storage keys
- SMTP passwords
- email provider passwords
- app passwords
- OAuth client secrets
- DKIM private keys
- connection strings

