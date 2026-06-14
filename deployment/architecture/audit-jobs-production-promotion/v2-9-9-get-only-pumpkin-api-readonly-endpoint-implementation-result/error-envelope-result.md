# Error Envelope Result

Implemented error codes:

- `AUDIT_JOB_SCOPE_REQUIRED`
- `AUDIT_JOB_AUTH_REQUIRED`
- `AUDIT_JOB_FORBIDDEN_ROLE`
- `AUDIT_JOB_FORBIDDEN_TENANT`
- `AUDIT_JOB_FORBIDDEN_SITE`
- `AUDIT_JOB_INVALID_PAGINATION`
- `AUDIT_JOB_PROVIDER_NOT_CONFIGURED`
- `AUDIT_JOB_CONTRACT_INVALID`

Every error response preserves:

- `providerMode: api-local-fixture-readonly`;
- `readOnly: true`;
- request and correlation IDs;
- closed security boundary;
- redacted/no-secret message shape.

