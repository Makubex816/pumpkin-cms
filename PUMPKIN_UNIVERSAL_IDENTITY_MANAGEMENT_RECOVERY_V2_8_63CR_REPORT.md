# Pumpkin universal identity management recovery V2.8.63CR report

Final status: `partial_features_active_operational_closeout_incomplete`.

V2.8.63C was carried forward from its three failed candidates and known-good deployment `85211338-ce94-4fba-bf3f-c1c238553936`. The closeout baseline was committed as `f6d09aef`. Compatibility repair `c03f0413` uses a bounded point read and availability-safe reconciliation; linkage repair `92ee1670` removes the invalid backfilled `legacyTenantId` assumption.

The isolated B1 canary deployment `931030db-d777-48d4-8a37-851af4844266` passed health, invalid login, SuperAdmin login, and TenantAdmin login. The identical package deployment `388a7fd1-cb09-4929-a335-bfbf0d6af291` was healthy but both production logins timed out. Dual-write was disabled and the verified V2.8.63B package was restored as deployment `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86`.

Final state: foundation and dual-read enabled; dual-write and all identity-management mutations disabled; tenant rename disabled; external provider not configured; Admin and starter not redeployed; no synthetic identity created; no customer credentials, emails, roles, memberships, slugs, contacts, forms, DNS, Airstrip public runtime, or indexing state changed. The temporary canary app and plan were deleted.

## Exact-path commit instructions

Stage only this root report, the directory `deployment/architecture/identity/v2-8-63cr-identity-management-recovery-result`, and the three `V2_8_63CR` durable documents under `deployment/architecture/pumpkin-platform`. Run `git diff --cached --check`, JSON parsing, secret/protected-path scans, and commit once. Do not use `git add -A`; do not stage packages, snapshots, credentials, backups, hardcopies, build output, or unrelated worktree files.
