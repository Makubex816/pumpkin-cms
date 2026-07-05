# Pumpkin Spectre Dev SuperAdmin Password Rotation V2.8.60WB

Date: 2026-07-05

## Status

Blocked before rotation.

The approved V2.8.60WB secure file was missing, so the Spectre Dev SuperAdmin password was not rotated.

## Source Confirmation

The source route remains:

`POST /api/admin/users/{tenantId}/{userId}/password`

The route is authenticated, SuperAdmin-only, and self-targeted. The source password policy requires:

- current password present;
- new password present;
- new password length at least 12 characters;
- new password different from current password.

Successful rotation stores the new password as a BCrypt hash.

## Current Outcome

- No login proof was run.
- No rotation request was sent.
- No old-password rejection proof was run.
- No new-password login proof was run.
- No hardcopy was created.
- No TenantAdmin account was changed.
- No deploy occurred.

## Resume Requirement

Provide the approved WB secure handoff at the exact expected path, then rerun the rotation phase without deploying.

