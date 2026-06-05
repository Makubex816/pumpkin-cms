# App Settings No-Email Result

Generated: 2026-06-05

## Mode

The endpoint is configured for no-email/mock verification:

```text
STATIC_FORM_FORWARD_MODE=dry-run
```

In this mode, valid requests are validated, sanitized, and accepted without Pumpkin API persistence and without email sending.

## Configured Setting Names

The deployed Function App has these relevant setting names configured:

- `FUNCTIONS_WORKER_RUNTIME`
- `FUNCTIONS_EXTENSION_VERSION`
- `AzureWebJobsFeatureFlags`
- `WEBSITE_RUN_FROM_PACKAGE`
- `STATIC_FORM_ALLOWED_SITE_KEYS`
- `STATIC_FORM_FORWARD_MODE`
- `STATIC_FORM_ALLOWED_ORIGINS`
- `STATIC_FORM_MAX_BODY_BYTES`
- `STATIC_FORM_MAX_MESSAGE_LENGTH`
- `STATIC_FORM_RATE_LIMIT_MODE`
- `STATIC_FORM_SPAM_PROTECTION_MODE`
- `ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY`

## Not Configured

These were confirmed absent by setting name:

- `ICE_RINK_RENTALS_API_KEY`
- `PUMPKIN_API_URL`
- `EMAIL_PROVIDER_MODE`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_TO_ADDRESS`

## Secret Handling

Azure runtime storage credentials and publishing credentials were not printed.

Temporary deployment package files were created outside the repo in `%TEMP%`.

The failed Linux run-from-package fallback temporarily used an internal package blob in the Function runtime storage account. That container was deleted after the Windows Function deployment succeeded.
