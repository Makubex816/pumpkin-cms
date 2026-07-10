# Starter Build and Redeploy Result

Validation before deploy:

- `npm run type-check`: passed;
- `npm run build`: passed;
- known warning retained: browser-side resolution warning for `pumpkin-ts-models` `fs` import;
- local host and preview smoke: passed;
- local responsive/browser checks: 15 passed, with zero overflow, broken images, POST requests, failed requests, HTTP errors, or local path leaks.

Deployment ZIP:

- outside-repo path: `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-61osg\deploy\starter-preview-v2-8-61osg.zip`;
- bytes: 5,844,530;
- SHA-256: `e682b3b112eb495602ad8fbcb398aa7427d71d1be0669dcef939734c74285d80`;
- entries: 1,824;
- backslash entries: 0;
- unsafe entries: 0;
- protected entries: 0;
- appsettings files: absent;
- required server, static, public theme, and fixture entries: present.

Deployment:

- target: `app-pumpkin-starter-preview-centralus-001`;
- resource group: `rg-pumpkin-api-prod-centralus`;
- command class: Azure App Service ZIP deployment;
- attempts used: 1/1;
- deployment id: `7bcca84d-9493-4d82-b7c4-705b0d88cd22`;
- Azure result: build successful, site started successfully, deployment completed successfully.

No second starter deployment was attempted.
