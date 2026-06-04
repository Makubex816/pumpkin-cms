# Validation And Sanitization Requirements

Generated: 2026-06-04

## Required Validation

The future endpoint should validate:

- request method is `POST`
- `Content-Type` is JSON
- request body size is within the approved limit
- site key is `ice-rink-rentals` for Ice submissions
- page slug is expected
- form ID or form key is expected
- required fields are present
- email-like fields have acceptable shape
- phone-like fields are bounded and normalized
- message fields are bounded
- origin is allowed

## Sanitization

The endpoint should sanitize:

- leading/trailing whitespace
- control characters
- unexpected nested objects
- unexpected field names
- HTML/script-like values before persistence or notification

Public responses should not echo raw submitted values.

## Spam And Abuse Controls

Future production setup should include:

- honeypot field convention
- IP or token rate limiting
- optional Cloudflare Turnstile or reCAPTCHA
- allowlist-based CORS
- logging that avoids storing sensitive values unnecessarily

## Existing Local Foundation

The repo already contains a local/testable endpoint foundation:

```text
deployment/static-azure/forms/static-form-endpoint/
```

It includes validation and sanitization helpers, a reusable handler, and an Azure Function wrapper example. This planning pass did not run or deploy it.

## Readiness Result

Validation and sanitization requirements are planned.

Production endpoint validation readiness: no.

