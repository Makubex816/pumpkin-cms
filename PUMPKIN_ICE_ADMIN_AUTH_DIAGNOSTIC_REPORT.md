# Pumpkin Ice Admin Auth Diagnostic Report

Created: 2026-06-03

## Scope

Diagnostic only for the IceSkatingRinkRentals.com admin JWT issue. No CMS records were written, no homepage/contact import was attempted, no `/service-areas`, Theme, or MediaAsset records were changed, and no static/deploy/DNS/email/provider/protected-config work was performed. RollerRinkRentals.com remains paused.

## Start State

Branch: `feature/admin-page-editor-import-export`

Git status at start: clean

Recent log:

```text
6eae0c9 Add Ice updated home contact draft import auth blocker report
2f4bb29 Add Ice updated home contact package intake
02fd805 Repair Pumpkin page contract persistence models
01a37ef Repair Phase 8N homepage contract persistence
97ddf11 Add Phase 8N homepage local draft overwrite report
34eef51 Fix Phase 8N homepage overwrite route guard
e2d150b Add Ice homepage Phase 8N scaffold validation package
e465511 Add Ice homepage draft preview and production rendering support
631c899 Add Ice homepage render diagnostic report
c60217f Add Ice contact local draft import report
2d8bb45 Add Ice homepage local draft import report
892dccb Add Ice homepage local draft import auth blocker report
```

API reachability: `http://localhost:5064` reachable, HTTP 200.

Admin frontend reachability: `http://localhost:3000` reachable, HTTP 200.

Temp JWT at diagnostic run: MISSING.

Env JWT at diagnostic run: MISSING.

## Files Changed

- `tools/auth-diagnostics/inspect-admin-jwt-shape.mjs`
- `tools/auth-diagnostics/probe-admin-auth.mjs`
- `content-review/ice-admin-auth-diagnostic/README.md`
- `content-review/ice-admin-auth-diagnostic/AUTH_CODE_PATH_REVIEW.md`
- `content-review/ice-admin-auth-diagnostic/LOCALSTORAGE_TOKEN_SOURCE.md`
- `content-review/ice-admin-auth-diagnostic/TOKEN_SHAPE_DIAGNOSTIC.md`
- `content-review/ice-admin-auth-diagnostic/AUTH_PROBE_RESULT.md`
- `content-review/ice-admin-auth-diagnostic/LIKELY_ROOT_CAUSE.md`
- `content-review/ice-admin-auth-diagnostic/NEXT_AUTH_RETRY_STEPS.md`
- `content-review/ice-admin-auth-diagnostic/manifest.json`
- `PUMPKIN_ICE_ADMIN_AUTH_DIAGNOSTIC_REPORT.md`

## Source Auth Paths Reviewed

- `apps/admin/src/contexts/AuthContext.tsx`
- `apps/admin/src/app/login/page.tsx`
- `apps/admin/src/lib/api.ts`
- `apps/pumpkin-api/Program.cs`
- `packages/pumpkin-ts-models/src/models/User.ts`

## LocalStorage Findings

- Token key: `pumpkin_auth_token`
- Token value: raw JWT string
- User key: `pumpkin_user`
- Current tenant key: `pumpkin_current_tenant`

Do not copy `pumpkin_user` or `pumpkin_current_tenant` into the temp JWT file.

## Expected Token And Header Format

- Temp file should contain the raw JWT only.
- Do not include `Bearer ` in the temp file.
- API requests should send `Authorization: Bearer <raw JWT>`.
- Admin identity probe endpoint: `GET /api/auth/verify`.
- Admin page endpoints require valid JWT plus either matching `tenantId` or `SuperAdmin`.

## Diagnostic Result

Token-shape helper result: token missing, no raw token printed.

Auth probe result: token missing, probe not performed, no CMS write.

## Likely Root Cause

Current classification: unknown without a token to inspect.

Most likely causes to check next:

- Wrong localStorage key copied.
- JSON wrapper copied instead of raw JWT.
- `Bearer ` prefix copied into the temp file.
- Expired browser token.
- Stale token after API restart or signing key change.
- Issuer/audience mismatch with the running API.
- Frontend session connected to a different API base than `http://localhost:5064`.

Tenant or role mismatch is less likely for the prior 401 because a valid-but-unauthorized token would usually reach endpoint logic and return 403.

## Checks

- `node --check` for changed helper scripts: passed
- Manifest JSON parse: passed
- `git diff --check`: passed
- Trailing whitespace scan: passed
- Protected/generated/raw artifact path check: passed
- Targeted secret scan: passed
- Token/JWT/secret written to repo: no
- CMS writes: no

## Safe Retry Steps

In the browser console at `http://localhost:3000`:

```js
Object.keys(localStorage)
  .filter((key) => /pumpkin|auth|token|tenant|user/i.test(key))
  .map((key) => {
    const value = localStorage.getItem(key) || '';
    return {
      key,
      length: value.length,
      looksJwt: value.split('.').length === 3,
      startsBearer: /^Bearer\s+/i.test(value.trim()),
      startsJson: value.trim().startsWith('{')
    };
  })
```

Copy only the raw JWT:

```js
copy((localStorage.getItem('pumpkin_auth_token') || '').replace(/^Bearer\s+/i, '').trim())
```

Write it to the temp file:

```powershell
Set-Content -NoNewline -Path "$env:TEMP\pumpkin-admin-jwt.txt" -Value (Get-Clipboard)
```

Run diagnostics:

```powershell
node tools\auth-diagnostics\inspect-admin-jwt-shape.mjs
node tools\auth-diagnostics\probe-admin-auth.mjs --api-base http://localhost:5064
```

Expected probe result before import retry: HTTP 200 with safe category `valid`.

## Remaining Before Import Retry

- Provide a valid temp JWT or `PUMPKIN_ADMIN_JWT`.
- Confirm shape helper shows a non-expired three-part token.
- Confirm auth probe returns valid.
- Then rerun the guarded homepage/contact local draft import.

Static regeneration, production approval, deployment, indexing, DNS/email/provider work, and Roller remain out of scope.
