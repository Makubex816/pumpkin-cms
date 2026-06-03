# Validation Results

Passed:

- JSON parse for homepage candidate, contact candidate, combined package, and manifest.
- `node --check tools/import-preflight/import-preflight.mjs`.
- Homepage import preflight: valid for shape and local draft import.
- Contact import preflight: valid for shape and local draft import.
- .NET `validate-updated-home-contact`: Ok true, production-field persistence true, updated home/contact persistence true.
- Validator negative fixture: generic `East Coast` service-area wording failed as expected.
- Design-system fixtures: ok true, 28 passed, 0 failed.
- Media fixtures: ok true, 3 existing media-validation warnings.
- Default form fixtures: ok true, 21 passed, 0 failed.
- Tailwind/navigation fixtures: ok true.
- Page intake normalizer fixtures: ok true, 16 passed, 0 failed.
- TypeScript model check: passed.
- Unsafe payload scan: passed.
- Targeted secret scan: passed.
- Protected/generated/raw path status check: passed.
- Trailing whitespace scan: passed.
- `git diff --check`: passed with LF/CRLF notices only.

Known warnings:

- Homepage preflight warns that homepage has no formBlock. This is expected; the contact page owns the quote form.
- .NET warns about review-only root fields such as `reviewMetadata` and `mediaRequirements`; these existed in the review/import-candidate workflow and do not block local draft import.
- Media fixture validation reports 3 existing media-validation warnings from the fixture suite.

Artifacts:

- `homepage-ppec-import-preflight-result.json`
- `contact-ppec-import-preflight-result.json`
- `dotnet-updated-home-contact-ppec-result.json`
- `validator-generic-east-coast-negative-preflight-result.json`
- `validation-command-results.json`
