# Fixture Result

Implemented fake local fixtures:

- `fixtures/valid-minimal/`
- `fixtures/invalid-missing-required-file/`
- `fixtures/invalid-json/`
- `fixtures/invalid-schema/`
- `fixtures/invalid-cross-file/`

Fixture behavior:

- `valid-minimal` passes offline validation.
- `invalid-missing-required-file` fails with `REQUIRED_FILE_MISSING`.
- `invalid-json` fails with `JSON_PARSE_ERROR`.
- `invalid-schema` fails with `SCHEMA_VALIDATION_ERROR`.
- `invalid-cross-file` fails with `CROSS_FILE_FIELD_MISMATCH`.

No fixture contains real tenant secrets, API keys, protected config, CMS records, or external credentials.
