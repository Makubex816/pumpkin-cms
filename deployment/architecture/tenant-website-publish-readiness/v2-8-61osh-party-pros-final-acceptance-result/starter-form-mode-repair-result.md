# Starter Form Mode Repair Result

Source repair:

- file: `apps/starter-app/src/lib/host-tenant-routing.ts`;
- change: Party Pros built-in custom-host route changed from `disabled-preview` to `live-submit`;
- explicit `/preview/[tenantId]` rendering still passes preview mode unconditionally.

Validation:

- `npm run type-check`: passed;
- `npm run build`: passed;
- known `pumpkin-ts-models` browser-side `fs` warning only;
- local apex and `www` host-header contact proof: enabled `Send Details`;
- local explicit preview contact proof: disabled `Preview only`.

Package safety:

- deployed ZIP: outside repo;
- bytes: 6,069,519;
- SHA-256: `3f4aafed0ce13bc73f90f6cba98008831728fdeb0b01f09680fec718b8852c39`;
- entries: 2,213;
- backslash, unsafe, duplicate, protected, appsettings, and env entries: 0;
- required server, static, Party Pros theme, and fixture entries: present.

An earlier locally constructed archive was rejected before deployment because it contained Windows backslash entry names. It did not consume a deployment attempt.

Deployment:

- target: `app-pumpkin-starter-preview-centralus-001`;
- resource group: `rg-pumpkin-api-prod-centralus`;
- deployment class: Azure App Service ZIP deploy;
- attempts used: 1/1;
- deployment id: `d8988e70-ffcb-4cdd-a798-193d4c6c273e`;
- result: build successful, site started successfully, deployment completed successfully.

No second starter deployment was attempted.

