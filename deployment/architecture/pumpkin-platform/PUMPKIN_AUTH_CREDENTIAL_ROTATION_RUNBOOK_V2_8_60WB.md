# Pumpkin Auth Credential Rotation Runbook V2.8.60WB

Date: 2026-07-05

## Current State

V2.8.60WB was blocked before auth because the approved secure file was missing.

## Safe Resume Steps

1. Place the approved secure file at `.tmp/v2-8-60wb/secure/spectre-dev-password-rotation-policy-retry.json`.
2. Verify it is git-ignored.
3. Do not print passwords, tokens, cookies, or hashes.
4. Verify current Spectre Dev SuperAdmin login works.
5. Verify the live route returns auth/validation behavior and not HTTP 404.
6. Precheck the new password against source policy.
7. Submit exactly one password rotation request.
8. Verify the old Spectre Dev credential is rejected.
9. Verify the new Spectre Dev credential logs in.
10. Verify role remains SuperAdmin.
11. Verify SuperAdmin can access tenants, users, onboarding, and domains.
12. Verify TenantAdmin no-change only if approved credential material is present.
13. Create outside-repo hardcopy TXT/JSON/SHA.
14. Write only hardcopy path and SHA-256 to repo reports.
15. Delete the WB secure folder only after successful rotation, hardcopy, proof, reports, and validation.

## Hard Stops

- Secure file missing or not ignored.
- Current login fails before rotation.
- Route missing or returns HTTP 404.
- New password rejected by policy.
- Old credential still works after a reported successful rotation.
- New credential fails after a reported successful rotation.
- Hardcopy cannot be written after successful rotation.
- Any password or hash would be written to repo reports.

