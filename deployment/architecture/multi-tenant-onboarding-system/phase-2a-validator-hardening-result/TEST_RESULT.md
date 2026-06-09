# Test Result

Local validation commands passed:

```text
npm test
9 tests passed
```

```text
npm run check
source syntax checks passed
9 tests passed
```

```text
npm run validate:example
Validation passed: 0 error(s), 0 warning(s).
```

The test suite covers:

- valid fixture pass
- required file failure
- JSON parse failure
- schema failure
- tenant ID mismatch
- site key mismatch
- missing route page
- forbidden route
- unknown media reference
- unknown form reference
- forbidden local URL
- forbidden staging URL
- production noindex failure
- secret-looking value failure
- report JSON and Markdown output
- normalized gate status subset
- external checks skipped
