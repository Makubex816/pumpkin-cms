# Pumpkin Tenant Website Publish Readiness V2.8.60WD SuperAdmin Password Rotation Checksum Reconciliation Report

Date: 2026-07-06

## Phase Status

Status: `completed_checksum_reconciled_direct_operator_rotation_documented_no_mutation`

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: `superadmin_password_rotation_hardcopy_checksum_reconciliation_no_mutation`

V2.8.60WD reconciled the V2.8.60WC-DOC hardcopy TXT checksum blocker. The prior prompt-provided TXT checksum was treated as a transcription error and was not used as the authoritative value.

## Direct Operator Proof Summary

Source reviewed: redacted proof JSON only.

`.tmp\v2-8-60wc\operator-proof\rotation-proof-redacted.json`

Redacted proof confirms:

- Direct operator rotation status: `completed_direct_operator_password_rotation`.
- Old credential rejected: true.
- New credential login succeeded: true.
- Role after rotation: `SuperAdmin`.
- SuperAdmin tenants access HTTP: 200.
- SuperAdmin users access HTTP: 200.
- SuperAdmin domain bindings access HTTP: 200.
- Airstrip TenantAdmin proof: `airstrip_tenantadmin_login_unchanged`.
- Airstrip TenantAdmin login HTTP: 200.
- Old V2.8.47 hardcopy preserved: true.
- No domain/DNS action: true.
- No contact POST: true.
- No form submission: true.
- No customer-facing POST proof: true.
- No deploy: true.

The redacted proof scan found no raw password, bearer token, cookie, or BCrypt hash pattern.

## Checksum Reconciliation

Hardcopy folder:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-60wc-spectre-dev-superadmin-password-rotation`

Authoritative hardcopy hashes:

| File | Authoritative SHA-256 | Basis |
| --- | --- | --- |
| TXT | `8e99e59b6680d07cfa1c88db9126f4732da209d5ebccf4c8d0cf0d854d54b609` | Computed file hash matched `.sha256` file and redacted proof field. |
| JSON | `db20d6dd07ebf113ad7455fc19751d9d8d6fa1af1ad603b3d17090fbe853c189` | Computed file hash matched `.sha256` file and redacted proof field. |

Hardcopy TXT/JSON files were hashed only. Their contents were not read, printed, copied, parsed, or written to repo files.

## Old Hardcopy Preservation

The redacted proof records old V2.8.47 hardcopy preservation as true.

Old V2.8.47 hardcopy SHA-256 from redacted proof:

`9668d227b516bdb6811b1cfca77f4017bb5f6117f742c38176b51706d8147256`

Old hardcopy contents were not read or copied.

## Runtime No-Regression

GET-only runtime no-regression passed: 17/17 HTTP 200.

- Ice apex/www `/`, `/contact`, `/service-areas`, `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health`, `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.
- Airstrip production default host `/`, `/request-booking`, `/packages`, `/airstrip-the-club`: HTTP 200.

No contact POST or form submission occurred.

## Security Boundary

Confirmed:

- No password rotation performed by Codex.
- No current or new SuperAdmin password used by Codex.
- No hardcopy TXT/JSON content read, printed, copied, parsed, or written to repo.
- No deploy.
- No DNS/custom-domain action.
- No Bluehost action.
- No Azure hostname binding.
- No indexing action.
- No contact POST.
- No form submission.
- No customer-facing POST proof.
- No media/content mutation.
- No user/role/tenant mutation.
- No appsetting or DomainBinding mutation.
- No storage keys/listKeys.
- No SAS generation.
- No Key Vault secret query.
- No hardcopy staging.
- No `.tmp` staging.

## Cleanup State

After repo-safe documentation was created and validated, approved cleanup removed stale local proof/secure folders when present:

- `.tmp/v2-8-60wc/operator-proof`
- `.tmp/v2-8-60w/secure`

The new outside-repo hardcopy and old V2.8.47 hardcopy were not deleted.

## Files Created

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60WD_SUPERADMIN_PASSWORD_ROTATION_CHECKSUM_RECONCILIATION_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-60wd-password-rotation-checksum-reconciliation-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_SPECTRE_DEV_SUPERADMIN_PASSWORD_ROTATION_V2_8_60WD.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_SUPERADMIN_CREDENTIAL_HARD_COPY_V2_8_60WD.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AUTH_CREDENTIAL_ROTATION_RUNBOOK_V2_8_60WD.md`

## Next Approval

The next approval prompt is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-60wd-password-rotation-checksum-reconciliation-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

Do not use `git add -A`.

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60WD_SUPERADMIN_PASSWORD_ROTATION_CHECKSUM_RECONCILIATION_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-60wd-password-rotation-checksum-reconciliation-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_SPECTRE_DEV_SUPERADMIN_PASSWORD_ROTATION_V2_8_60WD.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_SUPERADMIN_CREDENTIAL_HARD_COPY_V2_8_60WD.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_AUTH_CREDENTIAL_ROTATION_RUNBOOK_V2_8_60WD.md"

git diff --cached --check
git commit -m "Add V2.8.60WD password rotation checksum reconciliation"
```
