# Validation Summary

Status: completed_for_blocked_closeout.

Completed:

- Secure file exists and is git-ignored.
- Old hardcopy SHA-256 verified.
- Pre-rotation current password login succeeded.
- Pre-rotation new password login rejected.
- Focused password-route tests passed.
- Pumpkin API Release build passed.
- Azure subscription verified.
- No active deployment was in progress before retry.
- Protected-config-excluded POSIX ZIP created.
- ZIP backslash entry count: 0.
- ZIP protected config entry count: 0.
- Pumpkin API deploy retry succeeded exactly once.
- Deployment id: `81fe72d5-eb79-430f-aa73-511f487eb422`.
- Pumpkin API `/health` and `/api/health`: HTTP 200.
- Live password route no longer returns HTTP 404.
- Authenticated empty-body readiness returned HTTP 400 validation behavior.
- Rotation request returned HTTP 400 due source password policy.
- Current password still logs in after rejected rotation.
- New password remains rejected.
- SuperAdmin tenants/users/domains API checks returned HTTP 200.
- Admin UI onboarding/domains routes returned HTTP 200.
- Runtime no-regression GET matrix passed.

Final guard results:

- Required result files exist: pass.
- Durable platform docs exist: pass.
- Root report exists: pass.
- `result-manifest.json` parse: pass.
- Focused test rerun: pass.
- Pumpkin API Release build rerun: pass, 0 warnings, 0 errors.
- `git diff --check` on V2.8.60WA files: pass.
- Trailing whitespace scan on V2.8.60WA files: pass.
- Secret-designated exact-value scan on V2.8.60WA files: pass, 0 hits.
- Disallowed command-shaped scan on V2.8.60WA files: pass, 0 hits.
- Protected-path guard: pass; no protected config added to reports or deploy package.
- Contact POST verification: pass, no contact POST performed.
- Form submission verification: pass, no form submission performed.
- DNS/indexing verification: pass, no DNS or indexing action performed.
- Storage/key/SAS verification: pass, no storage mutation, key/listKeys, SAS, connection string generation, or Key Vault secret query performed.
- Content/media verification: pass, no content write or media upload performed.
- Hardcopy state: expected blocked state; new V2.8.60WA hardcopy TXT/JSON/SHA files were not created.
- Secure cleanup state: secure folder retained because the phase is blocked.
- Staging state: pass, no files staged.
