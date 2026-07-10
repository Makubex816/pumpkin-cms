# Starter Build And Redeploy Result

Status: passed.

Validation:

- `npm run type-check`: passed.
- `npm run build`: passed with the known `pumpkin-ts-models/dist/PageJsonConverter.js` `fs` warning.
- A parallel validation attempt briefly raced `.next/types` regeneration; type-check was rerun by itself and passed.

Deployment package:

- Temporary ZIP: `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-61oq\deploy\starter-preview-v2-8-61oq.zip`.
- Bytes: `5835000`.
- SHA-256: `36a7dd137c2111462435fe76aac13354d80d004ff63e19d64ae0729d81c8bbbb`.
- Entries: `1822`.
- Included `server.js`: yes.
- Included `.next/static`: yes.
- Included `public`: yes.
- Included Party Pros fixture: yes.
- Bad path separators: no.

Redeploy:

- Command class: single `az webapp deployment source config-zip`.
- Target: `app-pumpkin-starter-preview-centralus-001`.
- Resource group: `rg-pumpkin-api-prod-centralus`.
- Attempt count: 1.
- Deployment id: `b15e7fae-e4b7-4853-a3b5-e9b474a09d89`.
- Deployment status: `RuntimeSuccessful`.
- Successful instances: `1`.
- Failed instances: `0`.

No second deploy was attempted.
