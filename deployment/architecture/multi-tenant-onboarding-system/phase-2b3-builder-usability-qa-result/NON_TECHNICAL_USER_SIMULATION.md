# Non-Technical User Simulation

## Simulated Path

Commands were run from:

```text
deployment/architecture/multi-tenant-onboarding-system/import-package-builder/
```

The simulated reviewer used:

```powershell
node src/builder-cli.mjs --help
node src/builder-cli.mjs --answers fixtures/valid-full-package.answers.json --out .tmp/qa-valid-full-dry-run --dry-run --validate --support-packet
node src/builder-cli.mjs --answers fixtures/valid-full-package.answers.json --out .tmp/qa-valid-full --overwrite --validate --support-packet
```

## What Worked

- Help output states required options, examples, exit codes, and local-only boundary.
- Dry-run clearly showed `Files written: 0`.
- Preview listed planned pages, approved routes, media refs, form refs, and summary-only diff mode.
- Generated package flow wrote 14 package files and passed validation with 0 errors and 0 warnings.
- Support packet redaction passed and checked 6 support files.
- `NON_TECHNICAL_SUMMARY.md` explains what passed, what needs fixing, what to do next, when to ask for help, and what not to paste.

## What Was Confusing

- Dry-run prints a validator command even though validation is skipped in dry-run mode. The output also states validation is skipped, so this is acceptable but should become clearer in the future UI.
- Support files include local absolute paths. That is useful for local QA evidence, but those paths should be redacted before an external ticket.
- The validator report still labels its phase as `2A-3`; that is correct for the validator package but may confuse non-technical readers reviewing Phase 2B builder evidence.

## Improvements Applied

- Added an evidence QA rehearsal section to `USAGE.md`.
- Added a when-to-ask-for-help section to `ANSWERS_FILE_FORMAT.md`.
- Added support packet evidence review guidance to `SUPPORT_PACKET_EXPORT.md`.
- Fixed malformed-domain guidance so it no longer suggests `https://https://...`.
- Focused blank domain output to one required-field issue.

## Ask-For-Help Triggers

The simulated reviewer should stop if they see a secret-like value, raw local path, staging URL, unknown media/form reference, another tenant name, Roller reference, Search Console request, indexing request, DNS request, deployment request, or email-sending request.
