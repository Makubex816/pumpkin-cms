# Test Result

## Local Tests Run

```powershell
npm run check
npm test
node src/builder-cli.mjs --answers fixtures/fake-pilot-example-event-rentals.answers.json --out .tmp/fake-pilot-example-event-rentals --overwrite --validate --support-packet
```

Final results:

- builder `npm test`: passed, 34 tests
- builder `npm run check`: passed, including 34 tests
- builder `npm run generate:example`: passed
- builder `npm run validate:generated-example`: passed, validator 0 errors and 0 warnings
- validator `npm test`: passed, 16 tests
- fake-pilot generation and support packet: passed, validator 0 errors and 0 warnings

## Coverage Added

- valid generated `forms.json` includes `leadRecipientRef`
- generated `forms.json` mirrors `leadRecipientRef` to `recipientGroup`
- generated `forms.json` omits raw `recipient` email
- legacy `recipientGroup` still validates
- missing recipient reference fails
- secret-like `leadRecipientRef` fails
- conflicting `leadRecipientRef` and `recipientGroup` fails
- fake-pilot fixture still validates
- support packet and operator handoff show safe recipient refs

Additional final hygiene scan results are recorded in the root report.

## Final Hygiene Results

- JSON parse: passed, 193 scoped JSON files, excluding the intentional invalid-json fixture
- `node --check`: passed, 30 builder/validator source and test files
- `git diff --check`: passed with LF/CRLF warnings only
- trailing whitespace scan: passed, 270 scoped files
- targeted secret scan: passed, excluding intentional negative fixtures and detector source/tests
- external-call source scan: passed
- scoped protected/raw/generated path check: passed
- generated fake/example `.tmp` package status check: clean/ignored
- generated fake/example `forms.json` raw `recipient` check: passed
