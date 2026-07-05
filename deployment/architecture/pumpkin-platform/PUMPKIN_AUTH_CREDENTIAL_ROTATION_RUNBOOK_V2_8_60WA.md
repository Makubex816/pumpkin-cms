# Pumpkin Auth Credential Rotation Runbook V2.8.60WA

Date: 2026-07-05

## Purpose

This runbook captures the safe retry path after V2.8.60WA. The password route is deployed and live; the remaining issue is that the proposed new password did not meet the source policy.

## Current Live State

- Pumpkin API deploy retry succeeded.
- SuperAdmin password route is live.
- Current Spectre Dev SuperAdmin password remains active.
- Proposed V2.8.60WA new password is not active.
- No new hardcopy was created.

## Safe Retry Inputs

Use a new approved secure handoff with:

- Current Spectre Dev SuperAdmin email.
- Current Spectre Dev SuperAdmin password.
- New policy-compliant Spectre Dev SuperAdmin password.
- Existing old hardcopy checksum for preservation proof.
- Outside-repo hardcopy destination.

Do not print or write any password, token, hash, or hardcopy value into repo files.

## Retry Procedure

1. Verify the approved secure file is present and git-ignored.
2. Verify Azure subscription identity before any live command.
3. Log in with the current SuperAdmin credential.
4. Confirm the proposed new credential is rejected before rotation.
5. Call the live password route once with current and new passwords.
6. If rotation succeeds, verify current credential is rejected.
7. Verify new credential login succeeds and role remains SuperAdmin.
8. Verify SuperAdmin APIs and Admin UI protected routes still work.
9. Create outside-repo hardcopy TXT/JSON/SHA files.
10. Write only redacted hardcopy path/checksum evidence into repo reports.
11. Delete the retry secure folder only after successful rotation, hardcopy, proof, reports, and validation.

## Hard Stops

- Stop if the new password fails source policy validation.
- Stop if current credential login fails before rotation.
- Stop if route returns HTTP 404.
- Stop if rotation succeeds but current credential still logs in.
- Stop if new credential login fails after successful rotation.
- Stop before any unrelated mutation.

## Not Approved In This Runbook

- DNS/domain changes.
- Contact POST.
- Form submission.
- Media upload.
- Content write.
- Storage mutation.
- Key Vault secret query.
- keys/listKeys/SAS/connection string generation.
- Search indexing.
- Reading protected config files outside the approved secure file.
