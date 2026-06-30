# Pumpkin Tenant Onboarding Security Boundary

## Public Package

The public package may be committed. It must contain no secrets.

Allowed public values:

- Tenant ID and display name.
- Public domains.
- Non-secret brand metadata.
- Page content and route metadata.
- Media file references without storage credentials.
- User emails/roles without passwords.
- Form field definitions and non-secret routing references.
- Publish and monitoring expectations.

## Secure Handoff

The secure handoff must stay outside the repo or in an approved ignored path for a single phase.

Secure-only values include:

- Tenant admin passwords.
- Tenant API keys.
- Static-contact keys.
- SWA deployment tokens.
- Provider API keys.
- SMTP credentials.
- Storage keys.
- SAS tokens.
- Connection strings.
- Bearer tokens and cookies.

## Reporting

Reports may state presence, ignored status, and cleanup status. Reports must not contain secret values.

## V2.8.50 Boundary

V2.8.50 is read-only for live systems. It creates package docs, schemas, examples, validator tooling, and reports only.
