# Next Phase Prompt

Approve V2.8.60WB-R Spectre Dev Policy-Compliant Password Rotation Resume only.

Before resuming, place the approved secure file at:

`.tmp/v2-8-60wb/secure/spectre-dev-password-rotation-policy-retry.json`

The secure file must be git-ignored and must contain the current Spectre Dev SuperAdmin credential, a policy-compliant new Spectre Dev SuperAdmin password, old hardcopy preservation/checksum data, and the outside-repo hardcopy destination. Do not print passwords, bearer tokens, cookies, password hashes, or auth secrets. Do not stage `.tmp` or hardcopy files.

Carryforward:

- V2.8.60WA already deployed the route.
- V2.8.60WB confirmed the source policy requires a new password with at least 12 characters and a value different from the current password.
- V2.8.60WB did not attempt login or rotation because the secure file was missing.
- No hardcopy was created.
- No TenantAdmin credential, role, or assignment changed.

Allowed on resume:

- auth login proof requests;
- live route readiness/auth verification;
- exactly one Spectre Dev password rotation request;
- old/new login proof;
- SuperAdmin role/access proof;
- TenantAdmin no-change proof only if approved credential material is present;
- outside-repo hardcopy creation after successful rotation;
- GET-only runtime no-regression proof.

Still not approved:

- Pumpkin API deploy;
- DNS/custom-domain/Bluehost/Azure hostname actions;
- indexing;
- contact POST;
- form submission;
- customer-facing POST proof;
- media/content mutation;
- TenantAdmin password change;
- role or tenant assignment changes;
- storage key/listKeys, SAS, connection string generation, or Key Vault secret query.

