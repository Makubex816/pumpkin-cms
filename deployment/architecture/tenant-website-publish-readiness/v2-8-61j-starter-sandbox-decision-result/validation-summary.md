# Validation Summary

Status: completed.

Validation results:

- V2.8.61IA carryforward commit verified: `0c27a27e Classify starter admin tenant-local boundary`.
- IA scoped status was clean before V2.8.61J work continued.
- Required root report, result package files, durable platform docs, starter source files, model source files, and starter lockfile exist.
- JSON parse passed with Node for:
  - `deployment/architecture/tenant-website-publish-readiness/v2-8-61j-starter-sandbox-decision-result/result-manifest.json`;
  - `apps/starter-app/package.json`;
  - `apps/starter-app/package-lock.json`.
- Node syntax check passed for starter JavaScript config files:
  - `apps/starter-app/next.config.js`;
  - `apps/starter-app/postcss.config.js`;
  - `apps/starter-app/tailwind.config.js`.
- Package build passed for `packages/pumpkin-ts-models`.
- Package build passed for `packages/pumpkin-block-views`.
- Starter `npm run type-check` passed.
- Starter `npm run build` passed with one non-fatal package export warning about `fs` resolution through `pumpkin-ts-models/dist/PageJsonConverter.js`.
- Starter local GET-only runtime proof passed:
  - `/` HTTP 200;
  - `/admin/login` HTTP 200;
  - `/admin` HTTP 200 effective `/admin/login`;
  - `/admin/forms` HTTP 200 effective `/admin/login`;
  - `/admin/themes` HTTP 200 effective `/admin/login`.
- Non-Airstrip production no-regression GET proof passed:
  - Ice apex `/`, `/contact`, `/service-areas`, `/api/static-contact-health`: HTTP 200;
  - Ice www `/`, `/contact`, `/service-areas`, `/api/static-contact-health`: HTTP 200;
  - Pumpkin API `/health`, `/api/health`: HTTP 200;
  - Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.
- `git diff --check` exited 0. Output contained warning-only LF-to-CRLF notices across the busy worktree, including unrelated pre-existing paths.
- Scoped trailing whitespace scan passed for V2.8.61J reports, durable docs, source edits, and starter lockfile.
- Scoped secret-like value scan passed for V2.8.61J reports and source edits.
- Scoped disallowed command-shaped scan passed: no command-shaped deploy, DNS, indexing, POST, storage key/listKeys, SAS, or `git add -A` action was found in V2.8.61J artifacts.
- Protected path guard passed:
  - no staged files;
  - no `.tmp` staged files;
  - no `apps/starter-app/node_modules`;
  - no `apps/starter-app/.next`;
  - no Airstrip path status under `apps/airstrip-frontend` or `deployment/airstrip`.
- Starter admin boundary recheck passed: denied-term hits were limited to explicit blocklist entries in `apps/starter-app/src/lib/starter-admin-boundary.ts`.
- `apps/starter-app/package-lock.json` exists and is intentionally ignored by the current repo rules; commit instructions must add it with exact-path `git add -f`.

Security and mutation result:

- No deploy occurred.
- No new Azure resource was created.
- No live Azure mutation occurred.
- No appsetting mutation occurred.
- No DNS/custom-domain action occurred.
- No indexing action occurred.
- No contact POST occurred.
- No form submission occurred.
- No customer-facing POST occurred.
- No media upload/delete occurred.
- No content, user, role, tenant, or DomainBinding mutation occurred.
- No storage keys/listKeys/SAS action occurred.
- No Key Vault query occurred.
- No protected config or hardcopy secret file was read.
- No secret value was written to V2.8.61J repo artifacts.
- Airstrip remained frozen: no Airstrip probe, deploy, mutation, default-host check, route check, or package-output change occurred.

Cleanup state:

- Starter dependency install artifacts were cleaned:
  - `apps/starter-app/node_modules` removed;
  - `apps/starter-app/.next` removed.
- The generated starter lockfile remains at `apps/starter-app/package-lock.json` as the intentional lockfile artifact.
- No files are staged.

Residual notes:

- `npm install --package-lock-only --ignore-scripts` and `npm ci --ignore-scripts` reported 5 audit findings: 1 moderate and 4 high. No audit fix was run.
- The busy worktree includes many unrelated pre-existing modified and untracked files outside the V2.8.61J exact-path commit set.
- `packages/pumpkin-ts-models/dist/models/IHtmlBlock.d.ts`, `IHtmlBlock.d.ts.map`, `Page.d.ts`, and `Page.d.ts.map` remain unrelated dirty dist residue and are excluded from V2.8.61J commit instructions.
