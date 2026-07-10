# Next Phase Prompt

Approve V2.8.61OSRB Party Pros Form E2E Corrected Secret Values and Live Proof.

Carryforward:
- V2.8.61OSR is committed at `123a2beb`.
- V2.8.61OSRA stopped before live action because the corrected secure handoff still lacked required secret values.
- OSRA performed no appsetting mutation, no deploy, no tenant key regeneration, no form submission, and no FormEntry creation.
- OSRA did not print or write secret values.
- OSRA retained the secure handoff for retry.

Required corrected secure handoff:
- `operatorReadbackAuth.headerName`: present.
- `operatorReadbackAuth.headerValue`: non-empty value.
- `runtimeSubmitAuth.tenantIdAppSettingName`: `PUMPKIN_TENANT_ID`.
- `runtimeSubmitAuth.tenantIdAppSettingValue`: `party-pros-philadelphia`.
- `runtimeSubmitAuth.apiKeyAppSettingName`: `PUMPKIN_API_KEY`.
- `runtimeSubmitAuth.apiKeyValue`: non-empty Party Pros submit key value.

Rules:
- Do not print the operator readback header value.
- Do not print the API key value.
- Do not copy the secure file into repo docs.
- Do not stage `.tmp` or secure files.

Approved resume actions after corrected handoff validates:
- Recheck no staged files.
- Recheck secure file exists and is ignored.
- Source-discover starter submit route and Pumpkin API key validation path.
- Confirm whether the provided runtime API key is accepted by Pumpkin API without printing it.
- If accepted, set only required starter appsettings on `app-pumpkin-starter-preview-centralus-001`.
- If not accepted but exact source-supported API-side setup exists, perform only that setup without printing secrets.
- Deploy starter exactly once if appsettings/source require it.
- Submit exactly one controlled Party Pros synthetic form request containing `TEST DO NOT CONTACT`, `v2-8-61osrb`, `party-pros-philadelphia`, and timestamp.
- Read back the FormEntry using the corrected operator readback auth.
- Prove Admin API/UI readback, tenant isolation, preview no-post, and runtime no-regression.

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
