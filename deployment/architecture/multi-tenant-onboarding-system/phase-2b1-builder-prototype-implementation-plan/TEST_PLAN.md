# Test Plan

## Unit Tests

- answers loader parses valid JSON
- answers loader fails clearly on invalid JSON
- answers validator requires tenant identity fields
- answers validator rejects unsafe production domains
- answers validator rejects local/staging URLs where production URLs are expected
- answers validator rejects secret-looking values
- route normalizer preserves `/` and adds trailing slash to other routes
- duplicate route detection fails
- approved/forbidden route overlap fails
- page reference checker requires one page per approved route
- media reference checker requires every page media reference in `media`
- form reference checker requires every page form reference to match `form.formId`
- package generator produces deterministic file records
- output path guard rejects protected or unsafe target paths

## Integration Tests

- valid answers generate a complete package folder
- generated package passes existing offline validator
- `--support-packet` writes support packet files
- invalid route answers fail before generation
- unsafe URL answers fail before generation
- secret-looking answers fail before generation and do not print value
- media reference without asset metadata fails
- form without recipient fails
- validator failure returns exit code `1`
- overwrite protection blocks non-empty output folder
- `--overwrite` replaces only known generated files inside safe folder
- `--dry-run` writes no package files

## Fixture Set

- `valid-minimal-answers`
- `invalid-missing-tenant-id`
- `invalid-bad-domain`
- `invalid-forbidden-local-url`
- `invalid-secret-looking-value`
- `invalid-route-overlap`
- `invalid-missing-page`
- `invalid-unknown-media-reference`
- `invalid-form-missing-recipient`
- `invalid-output-folder-not-empty`

## Safety Tests

- no network APIs are called
- no protected config paths are read
- no generated support packet copies raw answers by default if secret-like values were rejected
- Search Console/indexing fields remain metadata/hard-stop only
- Roller references are rejected unless explicitly allowed as paused metadata in a later approved rule
