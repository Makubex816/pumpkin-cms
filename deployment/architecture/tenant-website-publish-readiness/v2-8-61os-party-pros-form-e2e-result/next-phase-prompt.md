# Next Phase Prompt

Approve V2.8.61OSR Party Pros Controlled Form/Contact E2E Resume From Blocked Readback Handoff.

Carryforward:
- V2.8.61OR is committed at `fb03dd3d`.
- V2.8.61OS locally repaired starter source so Party Pros custom-domain host routes can render live-submit mode while `/preview/party-pros-philadelphia...` remains no-post.
- Starter type-check passed.
- Starter build passed with the existing shared model package `fs` warning.
- OS did not deploy, mutate appsettings, regenerate a tenant key, submit a form, or create a FormEntry.
- OS runtime no-regression passed 23/23 GET-only checks.

Required before resume:
- Provide `PUMPKIN_FORMENTRY_READBACK_AUTH_MODE=custom-header`.
- Provide `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME`.
- Provide `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE`.
- Do not print the auth value.

Approved resume actions:
- Recheck no staged files.
- Recheck Party Pros HTTPS custom-domain routes.
- Recheck deployed starter appsetting presence with secret values redacted.
- If needed, generate or use a Party Pros-scoped tenant API key through the source-supported secure path without printing the key.
- Set only required Party Pros/starter appsettings on `app-pumpkin-starter-preview-centralus-001`.
- Deploy starter at most once from the OS source repair.
- Perform exactly one controlled synthetic Party Pros form submission with test-only data containing `TEST DO NOT CONTACT`, `v2-8-61osr`, `party-pros-philadelphia`, and timestamp.
- Read back the created FormEntry using the custom header name/value environment variables.
- Prove tenant scope and Admin UI/API inbox visibility.
- Reprove preview no-post and runtime no-regression.

Still not approved:
- no real customer inquiry;
- no external client/customer email unless safe test routing is explicitly proven;
- no Airstrip action;
- no Ice mutation;
- no registrar DNS or nameserver change;
- no additional hostname/TLS mutation;
- no storage keys/listKeys/SAS;
- no API key/auth value printing;
- no `git add -A`.
