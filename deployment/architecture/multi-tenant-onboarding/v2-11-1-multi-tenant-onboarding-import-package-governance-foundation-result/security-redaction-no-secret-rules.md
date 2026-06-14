# Security Redaction No-Secret Rules

Rules:

- No secrets, protected config contents, credential values, or raw credential material in repo fixtures or docs.
- Protected config path names may appear only as rule text or deliberate negative fixtures.
- Passing import packages must not contain `.env.local`, `appsettings.Development.json`, real `local.settings.json`, credential cache, browser cookie, auth file, token file, key file, connection string, SAS URL, private key, or raw credential material.
- Import packages may name required runtime variables but must not include values.
- PII must be synthetic or redacted.
- Secret-like values are no-go.
- Protected config path references are no-go.

Validator coverage:

- secret-like value fixture fails;
- protected config reference fixture fails;
- redaction policy must be `references_only_no_values`;
- protected config policy must be `do_not_reference_protected_paths`.
