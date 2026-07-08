# Next Phase Prompt

Use this as the next approval prompt only if the owner wants to close the remaining TenantAdmin auth boundary gap.

```
Approve V2.8.61N TenantAdmin Auth Boundary GET-Only Proof only.

Repository:
C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms

Carry forward V2.8.61M:
- SuperAdmin login and auth verify passed.
- Authenticated SuperAdmin Admin UI browser proof passed.
- Read-only Admin API/CMS proof passed for the Ice tenant.
- Ice tenant row/count readback passed through source-supported authenticated APIs.
- Airstrip remained frozen and was not probed.
- No mutation, deploy, DNS, contact POST, form submission, customer-facing POST, media upload/delete, storage key/listKeys/SAS, or protected config read occurred.
- TenantAdmin live denial/read boundary proof remains open because credentials were not available.

Required secure file:
.tmp/v2-8-61n/secure/tenantadmin-auth-boundary-proof.json

Secure file fields:
- pumpkinApiBaseUrl
- adminUiBaseUrl
- tenantAdminEmail
- tenantAdminPassword
- tenantAdminTenantId
- expectedDeniedSuperAdminOnlyRoutes
- expectedAllowedTenantRoutes
- diagnosisCorrelationId

Rules:
- Read the secure file only for V2.8.61N.
- Do not print TenantAdmin password.
- Do not print bearer values, cookies, browser storage, or session material.
- Do not write secrets to repo reports.
- Do not copy the secure file into result packages.
- Do not stage `.tmp`.
- Delete `.tmp/v2-8-61n/secure` after successful closeout.

Scope:
- Login as TenantAdmin.
- Verify auth.
- Use GET-only Admin UI/browser and source-supported GET API checks.
- Prove SuperAdmin-only routes are denied or hidden for TenantAdmin where source-supported.
- Prove tenant-scoped allowed read routes work only for the TenantAdmin tenant.
- Do not use Airstrip unless the TenantAdmin tenant is explicitly non-Airstrip and separately approved.
- Do not mutate tenant/content/media/user/role/DomainBinding records.
- No deploy, DNS/custom-domain, contact POST, form submission, customer-facing POST, appsetting mutation, protected config read, storage key/listKeys/SAS, or indexing action.

Hard stops:
- Stop if secure file is missing or not ignored.
- Stop if TenantAdmin login fails.
- Stop if proof requires a write.
- Stop if proof requires Airstrip-specific probing without explicit owner approval.
- Stop if secrets would be printed or written.
```
