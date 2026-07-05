# Next Phase Prompt

Approve V2.8.60W2 Pumpkin API POSIX Package Deploy Repair, Spectre Dev SuperAdmin Password Rotation Retry, Hardcopy Creation, and TenantAdmin Login Proof only.

Carry forward:

- V2.8.60W secure file remains at `.tmp/v2-8-60w/secure/spectre-dev-password-rotation.json`.
- Password route repair is implemented in source and focused tests pass.
- The first approved deploy attempt failed in Kudu/OneDeploy parallel rsync.
- Failure classification: invalid argument on Windows-style path entries under `/home/site/wwwroot`.
- Live password route probe returned HTTP 404.
- Password rotation did not occur.
- Current Spectre Dev password still logs in.
- New hardcopy was not created.

Retry scope:

- Do not change the auth design.
- Build a POSIX-safe deployment artifact with forward-slash paths.
- Deploy Pumpkin API exactly once after artifact validation.
- Confirm the route is live.
- Rotate only Spectre Dev SuperAdmin password.
- Prove old password rejection and new password login.
- Prove role remains `SuperAdmin`.
- Create the outside-repo hardcopy only after successful rotation.
- Include an approved Airstrip TenantAdmin credential if live TenantAdmin login proof is required.

Still out of scope:

- custom-domain cutover;
- Bluehost DNS;
- Azure hostname binding;
- indexing;
- contact POST;
- form submission;
- customer-facing POST proof;
- media/content mutation;
- TenantAdmin password changes;
- role or tenant reassignment;
- storage keys/listKeys/SAS;
- Key Vault secret reads.
