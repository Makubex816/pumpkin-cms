# Starter Build Redeploy Result

Source changed: yes.

Validation before deploy:

| Check | Result |
| --- | --- |
| `npm run type-check` | passed |
| `npm run build` | passed with known `pumpkin-ts-models` `fs` warning |
| Local production smoke | passed |
| Deployment ZIP entry validation | passed |

Bundle-only fixture:

- Path: `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-61osb\preview-fixtures\party-pros-philadelphia\preview.json`
- Bytes: 37278
- SHA-256: `cb45b0e9af963299975781d7ce874f621c283749cdcd0e6096106f7d8dbbf383`
- Repo-staged: no

Deployment package:

- Path: `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-61osb\deploy\starter-preview-v2-8-61osb.zip`
- Bytes: 5830141
- SHA-256: `f8e92d7cd2a7021e957550cb56ea8be3347972f46fe6e9d413e8765c6cd7eed9`
- Entries: 1823
- Backslash entry paths: 0
- Contains `server.js`: yes
- Contains `.next/static`: yes
- Contains `public`: yes
- Contains Party Pros fixture: yes

Redeploy:

- Command class: single starter App Service ZIP deployment.
- Target: `app-pumpkin-starter-preview-centralus-001`.
- Resource group: `rg-pumpkin-api-prod-centralus`.
- Deployment id: `1e01000c-4c7e-4b8a-b86c-8b29c95fe9c1`.
- Result: `RuntimeSuccessful`.
- Successful instances: 1.
- Failed instances: 0.

Deploy count used in OSB: 1/1.
