# Pumpkin Tenant Website Publish Readiness V2.8.60WC SuperAdmin Password Rotation Report

Date: 2026-07-05

## Phase Status

Status: `blocked_hardcopy_txt_sha_mismatch_no_repo_secret_written`

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: `direct_operator_superadmin_password_rotation_repo_safe_documentation_no_mutation`

The live Spectre Dev SuperAdmin password rotation was completed outside Codex by the direct operator script. V2.8.60WC-DOC was approved only to document redacted proof, verify hardcopy paths and checksums, and run no-mutation closeout checks.

This documentation phase stopped at the hardcopy checksum gate because the computed TXT hardcopy SHA-256 did not match the expected TXT SHA-256 value in the prompt. No hardcopy contents were read or copied into repo files.

## Direct Operator Proof Summary

Redacted proof file read:

`.tmp\v2-8-60wc\operator-proof\rotation-proof-redacted.json`

Redacted proof summary:

- Status: `completed_direct_operator_password_rotation`.
- Old password rejected: true.
- New password login succeeded: true.
- Role after rotation: `SuperAdmin`.
- SuperAdmin tenants access HTTP: 200.
- SuperAdmin users access HTTP: 200.
- SuperAdmin domain bindings access HTTP: 200.
- TenantAdmin proof status: `airstrip_tenantadmin_login_unchanged`.
- TenantAdmin login HTTP: 200.
- Old hardcopy preserved: true.
- No domain/DNS action: true.
- No contact POST: true.
- No form submission: true.
- No customer-facing POST proof: true.
- No deploy: true.

The redacted proof scan found no raw password, bearer token, cookie, or BCrypt password hash pattern.

## Hardcopy Path And SHA-256

Hardcopy folder:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-60wc-spectre-dev-superadmin-password-rotation`

Hardcopy files exist:

- TXT: yes.
- JSON: yes.
- SHA file: yes.

Checksum result:

| File | Expected SHA-256 | Computed SHA-256 | Result |
| --- | --- | --- | --- |
| TXT | `8e99e59b6680d07cfa1c88db9126f4732da209d5ebcef4c88dcf0d854d54b609` | `8e99e59b6680d07cfa1c88db9126f4732da209d5ebccf4c8d0cf0d854d54b609` | mismatch |
| JSON | `db20d6dd07ebf113ad7455fc19751d9d8d6fa1af1ad603b3d17090fbe853c189` | `db20d6dd07ebf113ad7455fc19751d9d8d6fa1af1ad603b3d17090fbe853c189` | match |

The redacted proof JSON records the computed TXT hash value, but the prompt-provided expected TXT value is different. Because the phase explicitly hard-stops on expected-value mismatch, V2.8.60WC-DOC is blocked pending owner/operator checksum reconciliation.

## Old Hardcopy Preservation

The redacted proof states old hardcopy preservation is true.

Old V2.8.47 hardcopy SHA-256 recorded in redacted proof:

`9668d227b516bdb6811b1cfca77f4017bb5f6117f742c38176b51706d8147256`

Old hardcopy contents were not read or copied.

## Runtime No-Regression

Not run.

Reason: the hardcopy TXT checksum mismatch is a hard stop before runtime no-regression closeout.

## Security Boundary

Confirmed:

- No password rotation was performed by Codex.
- No hardcopy TXT or JSON contents were read or copied into repo reports.
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
- No storage keys/listKeys.
- No SAS generation.
- No Key Vault secret query.
- No hardcopy staging.
- No `.tmp` staging.
- No files staged.

## Validation

- Required result files exist.
- Durable docs exist.
- Root report exists.
- Redacted proof JSON parsed successfully.
- `result-manifest.json` parsed successfully.
- Hardcopy TXT/JSON/SHA files exist.
- JSON hardcopy SHA-256 matched expected.
- TXT hardcopy SHA-256 did not match expected; this is the active blocker.
- `git diff --check` passed on V2.8.60WC paths.
- Trailing whitespace scan passed.
- Repo report/source secret-like scan passed with 0 hits.
- Raw password/hash repo-output scan passed with 0 hits.
- Disallowed command-shaped scan passed with 0 hits.
- Protected-path guard passed.
- No files are staged.
- `.tmp/v2-8-60wc/operator-proof` was retained because checksum reconciliation is blocked.

## Files Created

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60WC_SUPERADMIN_PASSWORD_ROTATION_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-60wc-direct-password-rotation-doc-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_SPECTRE_DEV_SUPERADMIN_PASSWORD_ROTATION_V2_8_60WC.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_SUPERADMIN_CREDENTIAL_HARD_COPY_V2_8_60WC.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AUTH_CREDENTIAL_ROTATION_RUNBOOK_V2_8_60WC.md`

## Next Approval

The exact resume prompt is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-60wc-direct-password-rotation-doc-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

Do not use `git add -A`.

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60WC_SUPERADMIN_PASSWORD_ROTATION_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-60wc-direct-password-rotation-doc-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_SPECTRE_DEV_SUPERADMIN_PASSWORD_ROTATION_V2_8_60WC.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_SUPERADMIN_CREDENTIAL_HARD_COPY_V2_8_60WC.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_AUTH_CREDENTIAL_ROTATION_RUNBOOK_V2_8_60WC.md"

git diff --cached --check
git commit -m "Add V2.8.60WC direct password rotation documentation"
```
