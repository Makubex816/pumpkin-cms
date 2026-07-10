# Next Phase Prompt

## V2.8.61OSHRA - Party Pros Authenticated Form Reproof and CMS Persistence Decision

Carry forward the live OSHR catalog/navigation and consent repair without redeploying it.

Required owner input for form reproof:

- provide process-scoped `PUMPKIN_FORMENTRY_READBACK_AUTH_MODE=custom-header`;
- provide `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME` and `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE` through an approved secure channel;
- do not place or print the auth value in chat, logs, source, or result files.

Required gates:

1. Prove custom-header Party Pros FormEntry readback returns HTTP 200 before mutation.
2. Confirm live consent remains present/required and preview remains disabled/no-post.
3. If separately approved, perform at most one marked synthetic Party Pros submission.
4. Read back the new entry and prove the same id is absent under Ice.
5. Keep Airstrip untouched.

CMS persistence is a separate mutation decision within the phase. Do not mutate CMS records unless the owner explicitly approves the reconciled import/update plan, backup, exact record scope, readback, and rollback boundary.

Still prohibited without separate approval: starter/API/Admin/Ice deploy, media mutation, real customer data, external email, DNS/TLS/registrar action, storage keys/listKeys/SAS, Airstrip action, generated artifact staging, and `git add -A`.

