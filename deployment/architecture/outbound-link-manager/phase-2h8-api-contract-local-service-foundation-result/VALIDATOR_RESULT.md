# Validator Result

Validator added:

- `src/validators/api-response-validator.mjs`

Validator checks:

- envelope parses
- required envelope fields exist
- `ok`, `status`, and `code` are consistent
- tenant/site scope exists
- pagination metadata is valid
- known error codes are used
- response contains no credential-shaped values
- validation output remains under `.tmp`

Test result:

- Valid API response: passed.
- Malformed response: failed as expected.
- CLI `validate-api-response`: passed.

