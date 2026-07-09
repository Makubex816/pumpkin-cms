# Starter Redeploy Result

Status: passed.

Approved target:

- App Service: `app-pumpkin-starter-preview-centralus-001`
- Resource group: `rg-pumpkin-api-prod-centralus`

Deployment command class:

- Single `az webapp deployment source config-zip` run.
- No retry.
- No second starter deploy.

Deployment package:

- Temporary path during run: `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-61oj-resume\deploy\starter-preview-v2-8-61oj-resume.zip`
- Bytes: 5844992
- Entries: 1825
- SHA-256: `cbcc2f551dec154bf8bb07e779d1637a9241bb377f8de8554920b2d7210d7390`
- Included `server.js`: yes
- Included `.next/static`: yes
- Included `public`: yes
- Included Party Pros fixture: yes
- Bad path separators: no

Azure result:

- Deployment id: `28d1bd67-834d-4710-a295-e9abcb4b1601`
- Deployment status: `RuntimeSuccessful`
- Successful instances: 1
- Failed instances: 0

No API deploy, Admin UI deploy, appsetting mutation, DNS/custom-domain action, new Azure resource, or Airstrip action occurred.
