# Validation Summary

Validation status: completed with blocker.

Passed:

- Azure subscription lock matched `ff887def-fd83-4a19-9298-13d4b1687873`.
- Secure file existed and was git-ignored.
- Static contact compat source readiness passed.
- `npm run check` passed.
- `npm test` passed.
- `npm run type-check` passed.
- `npm run validate:static:ice` passed with existing content warnings.
- Sanitized static build passed.
- Task-specific SWA package readiness passed once deployment token was present in process.
- Isolated appsetting bind succeeded.
- Isolated deploy succeeded.
- Isolated health/contact/Admin preflights passed.

Blocked:

- Single isolated contact POST returned HTTP 502.
- Admin readback did not find the isolated trace because the POST failed.
- Production appsetting bind/deploy/POST/readback were not run.

Final classification:

`isolated_static_contact_delivery_failed_http_502_after_api_deploy_no_production`

Closing guards:

- `result-manifest.json` parse: passed.
- Result-package trailing whitespace scan: passed.
- `git diff --check` on scoped deliverables: passed.
- High-confidence secret scan on scoped result/source files: passed.
- Restricted-action scan: only non-action documentation mentions found.
- Changed/new JS/MJS in scoped deliverables: none; compat source was covered by `npm run check`.
- Staged files at close: none.

Post counts:

- Isolated contact POST attempts: 1.
- Production contact POST attempts: 0.
