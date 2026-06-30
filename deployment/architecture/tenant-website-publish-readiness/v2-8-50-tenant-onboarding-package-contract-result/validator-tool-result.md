# Validator Tool Result

Result: created and executed.

Tool:

- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/validate-tenant-package.mjs`

Capabilities:

- Parses package JSON files.
- Checks required modules.
- Checks required full-template files.
- Scans public package JSON for secret-like values.
- Checks tenant ID consistency.
- Verifies baseline pages.
- Verifies media file references when media entries are declared.
- Verifies users have `passwordSource` and no password.
- Verifies forms have fields.
- Verifies validation expected routes.
- Writes machine-readable summaries under `.tmp/tenant-onboarding/`.

Syntax check:

- `node --check`: passed.
