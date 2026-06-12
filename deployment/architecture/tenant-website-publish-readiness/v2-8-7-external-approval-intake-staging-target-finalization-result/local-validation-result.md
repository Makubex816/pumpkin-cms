# Local Validation Result

Status: completed for docs/control-layer scope.

Commands run:

```text
git status --short
git log --oneline -15
git diff --cached --name-only
npm run validate:static:ice
npm run type-check
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612151525/repo/apps/ice-rink-web/out
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612151525/repo/apps/ice-rink-web/out
```

Results:

- Start-state checks reviewed V2.8.6 as the committed predecessor and confirmed no staged files.
- `npm run validate:static:ice` passed from `apps/ice-rink-web` with 3 pages, 3 sitemap entries, and 34 existing quality warnings.
- `npm run type-check` passed from `apps/ice-rink-web`.
- Static output validator returned the expected no-go classification: `blocked_external_approval_gate`, with `localStaticIntegrityOk: true`, `externalApprovalGateCount: 2`, and no structural errors.
- Staging package validator returned the expected no-go classification: `blocked_external_approval_gate`, with `localStaticIntegrityOk: true`, `externalApprovalGateCount: 2`, and no structural errors.
- The two external approval gates remain `static-form-endpoint-configured` and `static-form-backend-verification`.

V2.8.6 build output was reused because V2.8.7 did not change source, validators, or build scripts.

Final validation for this package is recorded in `validation-summary.md`.
