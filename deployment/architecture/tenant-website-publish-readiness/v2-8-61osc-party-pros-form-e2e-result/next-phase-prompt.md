# Next Phase Prompt

Approve V2.8.61OSD Party Pros Form E2E Accepted-Key Retry only after providing an accepted Party Pros submit key or accepted Admin/SuperAdmin source-supported key setup auth.

Carryforward from OSC:

- OSB remains committed and accepted at `d3b1eb8d`.
- OSRA remains committed and accepted at `fd13e767`.
- OSC secure handoff exists and is ignored.
- OSC required secure fields were present, but the submit key returned `401`.
- OSC operator/readback custom header returned `401` against Admin API.
- Visible `PUMPKIN_ADMIN_JWT` returned `401` against Admin API.
- OSC performed no appsetting mutation, deploy, form submit, FormEntry creation, API-side key mutation, Ice mutation, or Airstrip action.
- Party Pros custom-domain HTTPS/media prerecheck passed.
- Preview contact remained no-post.
- Runtime no-regression passed 23/23 GET-only checks.

Next approval must provide one of:

- a Party Pros tenant API key that is already accepted by the live Pumpkin API for `party-pros-philadelphia`; or
- a valid source-supported SuperAdmin/Admin auth path that can update the Party Pros Tenant record so the approved submit key becomes accepted by the API, without printing secret values.

Next phase allowed actions, if explicitly approved:

- verify secure handoff and accepted key without printing values;
- configure only required starter appsettings;
- enable custom-host live-submit only through source-supported `PUMPKIN_HOST_TENANT_ROUTES_JSON`;
- deploy/restart starter at most once if required;
- perform exactly one controlled synthetic Party Pros form submission;
- read back the created FormEntry through accepted Admin API/UI auth;
- prove tenant scope and no Ice mutation;
- run non-Airstrip runtime no-regression;
- write repo-safe closeout docs.

Still not approved unless explicitly restated:

- no real customer inquiry;
- no external client/customer email;
- no more than one controlled Party Pros synthetic submission;
- no Ice form submission;
- no Airstrip probe/action;
- no registrar/DNS/nameserver mutation;
- no additional hostname binding;
- no TLS work;
- no storage keys/listKeys/SAS;
- no secret/token/cookie/API key printing;
- no `.tmp`, secure file, hardcopy, backup, package-output, screenshot/browser artifact, deployment ZIP, `.next`, `node_modules`, or media staging;
- no `git add -A`.
