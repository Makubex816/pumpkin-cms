# Validation Summary

## Passed

- Azure CLI account check passed without recording identity details.
- Azure Static Web App metadata lookup confirmed the exact target.
- Sanitized no-dotenv static build passed: `sanitized_20260612222605`.
- `npm run validate:static:ice` passed with 34 existing warnings.
- `npm run type-check` passed.
- `node scripts/static-publish.mjs generate` passed with 34 existing warnings.
- Static output validator passed.
- Staging package validator passed.
- Artifact route/file checks passed.
- Artifact forbidden-path scan passed.
- Artifact high-confidence secret-like scan passed.
- Runtime QA package check passed.
- Runtime QA evidence run passed: `runtimeqa_b459ecae015b5e4a`.
- Runtime QA evidence validation passed with 1 warning.
- Resource Registry operational binding validation passed with 0 failures and 0 warnings.
- OLM provider profile check passed for planning while live writes stayed disabled.
- Static form endpoint package check and tests passed.
- Result manifest parsed and all 22 required files exist.
- High-confidence secret-like scan found no matches in the V2.8.14 docs/package/control-doc scope.
- Scoped source/script write scan found no source or script changes; deployment was not attempted.
- `git diff --check` passed on tracked platform control docs with line-ending warnings only.
- Generated `.tmp` and `.static-artifacts` outputs remain ignored and unstaged.
- No files are staged.

## Blocked

- Deployment blocked before upload because production custom domains are attached to the target, deployment token env vars are absent, and `swa` CLI is unavailable.

## Not Run

- Scoped staging deployment.
- Post-deploy route checks.
- Contact form submission.
- Contact endpoint POST.
- DNS/indexing/live publication actions.
