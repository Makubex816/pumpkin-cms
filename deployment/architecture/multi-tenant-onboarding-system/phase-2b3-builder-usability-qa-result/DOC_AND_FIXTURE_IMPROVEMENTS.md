# Doc And Fixture Improvements

## Builder Error Text

Updated:

```text
deployment/architecture/multi-tenant-onboarding-system/import-package-builder/src/answers-validator.mjs
```

Improvements:

- blank fields stop at required-field errors
- canonical URL suggestions use only verified plain production domains
- malformed primary domains no longer produce `https://https://...` suggested fixes

## Fixtures

Added:

- `fixtures/invalid-unknown-media-reference.answers.json`
- `fixtures/invalid-unknown-form-reference.answers.json`

Purpose:

- prove media references fail before package generation when the media ID is not declared
- prove form references fail before package generation when the form ID is not declared

## Tests

Updated:

- invalid fixture matrix now includes unknown media and unknown form references
- missing-domain test asserts a focused required-field error
- CLI invalid-answer test asserts issue code, fix, ask-for-help guidance, and no malformed URL suggestion
- support packet test asserts all 6 redaction-scanned files are included

## Docs

Updated:

- `USAGE.md`: added evidence QA rehearsal commands
- `ANSWERS_FILE_FORMAT.md`: added when-to-ask-for-help cues
- `SUPPORT_PACKET_EXPORT.md`: added support packet evidence review checklist
