# Validation Summary

Overall result: pass.

Start-state:

- `git status --short`: busy worktree observed.
- `git log --oneline -15`: latest commit `2286aec Complete V2.8.19F existing Azure media source integration`.
- `git diff --cached --name-only`: empty.

Target classification:

- Isolated staging target verified: `swa-ice-static-isolated-staging`.
- Isolated default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`.
- Isolated custom domains: none.
- Production-bound target verified: `swa-ice-static-staging`.
- Production-bound custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`.

Local validations:

- `npm run validate:static:ice`: pass with existing 34 warnings.
- `npm run type-check`: pass.
- `npm run build:static:ice:sanitized`: pass.
- Sanitized artifact route/content/email/media validation: pass.
- Artifact file count: 41.
- Artifact aggregate SHA-256: `4c0f5e7babc104c8223ddfdc37d95dd863190796db809544d4e9e3acf44e9897`.

Media validation:

- Source mapped Azure URLs: 9.
- Static output unique Azure URLs: 8.
- Exact known Azure Blob HEAD checks: 9 of 9 returned 200 `image/png`.
- Local media references in selected output: 0.

Deployment:

- SWA CLI version: `2.0.9`.
- Token readiness checks: pass, boolean-only, token not printed.
- Isolated staging deployment attempts sent: 1.
- Deployment result: success.
- Preview URL: `https://kind-island-0a85a740f.7.azurestaticapps.net`.

Runtime:

- `/`: 200.
- `/service-areas`: 200.
- `/contact`: 200.

Hard-stop confirmations:

- No production-bound deployment.
- No production-domain route checks.
- No DNS/custom-domain mutation.
- No Search Console/indexing.
- No Azure media upload or mutation.
- No contact form POST.
- No protected config content read.
- No token print/list/export/reset.
- No files staged.

Closeout checks:

- `result-manifest.json` parse: pass.
- `node --check` for V2.8.19G JS/MJS changes: not applicable.
- `git diff --check`: pass with existing busy-worktree line-ending warnings only.
- Scoped trailing whitespace scan: pass.
- Scoped secret-like scan: pass.
- Deploy-target manifest scan: pass, isolated target only.
- Protected/generated/raw path guard for result package: pass.
- Final `git diff --cached --name-only`: empty.
