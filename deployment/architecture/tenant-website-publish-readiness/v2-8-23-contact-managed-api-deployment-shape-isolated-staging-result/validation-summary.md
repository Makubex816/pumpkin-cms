# Validation Summary

Start-state:

- `git status --short`: busy worktree recorded.
- `git log --oneline -15`: latest commit was V2.8.22 remediation.
- `git diff --cached --name-only`: no staged files.

Local checks:

- Static function `npm run check`: pass.
- Static function `npm test`: pass.
- Static function checks after CommonJS entrypoint update: pass.
- Static function tests after CommonJS entrypoint update: pass.
- CommonJS entrypoint import check: pass in `@azure/functions` test mode.
- Ice `npm run type-check`: pass.
- Ice `npm run validate:static:ice`: pass with 34 existing warnings.
- Ice sanitized static build: pass, `sanitized_20260625230507`, protected config copied false.
- Contact artifact endpoint verification: pass.
- Deployed-package readiness wrapper: pass before deployment.
- Next-candidate readiness wrapper: pass after no-retry local fix.

Strict validators:

- Static output validator: static form gate passed, failed on 165 known non-contact media-origin policy findings.
- Staging package validator: static form gate passed, failed on the same 165 known non-contact media-origin policy findings.

Live isolated checks:

- App plus API deployment: succeeded, exactly one attempt.
- Isolated `/contact` GET: 200.
- Isolated `/api/static-contact` OPTIONS: 204.
- Isolated `/api/static-contact` POST: sent exactly once, failed 404 empty body.

Final validation:

- JSON parse for changed/new JSON files: pass with Node `JSON.parse`.
- `node --check` for changed JS/MJS files: pass.
- `git diff --check`: pass, line-ending warnings only.
- Scoped trailing whitespace scan: pass.
- High-confidence secret-like scan: first pass flagged validator regex literals only; value-shaped rerun passed.
- Command-shaped production deploy-target scan: pass.
- Protected/generated/raw scoped path guard: pass.
- Final staged-file check: pass, no files staged.
