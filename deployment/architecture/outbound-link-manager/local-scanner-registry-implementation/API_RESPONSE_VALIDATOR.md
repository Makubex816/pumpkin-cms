# API Response Validator

Phase 2H-8 adds `src/validators/api-response-validator.mjs`.

The validator checks:

- response envelope parses
- required envelope fields exist
- `ok`, `status`, and `code` are consistent
- tenant/site scope is present
- pagination metadata is valid when present
- known error codes are used
- response contains no credential-shaped values
- validation output is written under `.tmp`

CLI usage:

```powershell
node src/outbound-link-cli.mjs validate-api-response --response .tmp/api-list-links
```

The validator writes:

- `API_RESPONSE_VALIDATION_RESULT.json`
- `API_RESPONSE_VALIDATION_RESULT.md`

This validator is local-only. It does not call live APIs or validate production endpoints.

