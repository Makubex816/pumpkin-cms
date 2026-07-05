# Pumpkin Auth Credential Rotation Runbook V2.8.60W

Status: active retry guidance.

## Required Sequence

1. Verify the approved secure handoff exists and is ignored.
2. Verify old hardcopy SHA-256 without reading or printing hardcopy contents.
3. Prove current login works.
4. Confirm source route support or implement the minimal route.
5. Run focused tests and API build.
6. Deploy API only under explicit approval.
7. Confirm the password route is live.
8. Rotate only the approved target user.
9. Prove old password rejection.
10. Prove new password login.
11. Prove role remains `SuperAdmin`.
12. Prove required SuperAdmin API/UI access.
13. Prove TenantAdmin login only if an approved secure handoff supplies the TenantAdmin credential.
14. Create the outside-repo hardcopy only after rotation succeeds.
15. Delete the secure handoff only after rotation, proof, hardcopy, reports, and validation succeed.

## Hard Stops

- Stop if deploy fails before rotation.
- Stop if the new route is not live.
- Stop if old password still works after rotation.
- Stop if new password fails after rotation.
- Stop if hardcopy creation fails after rotation.
- Stop if any password, bearer token, cookie, JWT, or password hash would be printed or written to repo.

## Boundaries

Credential rotation does not approve custom-domain work, DNS, indexing, contact POST, form submission, media mutation, content mutation, storage keys/listKeys, SAS, Key Vault secret reads, TenantAdmin password changes, role changes, or tenant reassignment.
