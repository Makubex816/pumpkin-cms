# Next Phase Prompt

Approve V2.8.61OSR2 Party Pros Form E2E Secure Handoff Correction and Live Proof.

Carryforward:
- V2.8.61OS is committed at `8597a05e`.
- V2.8.61OSR performed no live mutation, no deploy, and no form submission.
- OSR source discovery confirmed the starter live submit path requires `PUMPKIN_TENANT_ID` and `PUMPKIN_API_KEY`.
- OSR source discovery found no app runtime code requiring `PUMPKIN_FORMENTRY_READBACK_AUTH_*`; these are operator-side Admin readback request inputs.
- OSR HTTPS custom-domain prerecheck passed.
- OSR preview no-post reproof passed.
- OSR starter type-check/build passed.
- OSR runtime no-regression passed 23/23 GET-only checks.

Required corrected handoff:
- Provide a non-empty custom-header readback auth value via the approved secure handoff or shell environment.
- Provide the custom-header name or environment variable value needed for Admin readback.
- Provide a Party Pros submit key candidate, or explicitly approve source-supported Party Pros tenant API key regeneration with direct secret piping into the starter appsetting.
- Do not print the auth value or submit key.

Approved resume actions:
- Recheck no staged files.
- Recheck secure handoff exists and is ignored.
- Recheck HTTPS custom-domain routes.
- Set only source-required starter appsettings:
  - `PUMPKIN_TENANT_ID=party-pros-philadelphia`;
  - `PUMPKIN_API_KEY` from secure handoff or source-supported one-time generation, without printing;
  - API URL setting only if missing.
- Do not set `PUMPKIN_FORMENTRY_READBACK_AUTH_*` as runtime appsettings unless new source discovery shows an app requires them.
- Deploy starter at most once.
- Submit exactly one controlled synthetic Party Pros form request containing `TEST DO NOT CONTACT`, `v2-8-61osr2`, `party-pros-philadelphia`, and timestamp.
- Read back the FormEntry using the approved custom-header request.
- Prove Admin UI/API readback and tenant isolation.
- Reprove preview no-post and runtime no-regression.

Still not approved:
- no real customer inquiry;
- no external client/customer email;
- no Airstrip action;
- no Ice mutation;
- no registrar DNS or nameserver change;
- no additional hostname/TLS work;
- no storage keys/listKeys/SAS;
- no secret/API key/auth value printing;
- no `.tmp` staging;
- no `git add -A`.
