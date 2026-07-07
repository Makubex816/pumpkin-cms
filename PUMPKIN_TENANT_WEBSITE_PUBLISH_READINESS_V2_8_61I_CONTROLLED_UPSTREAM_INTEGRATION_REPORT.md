# V2.8.61I Controlled Upstream Integration Report

Status: completed source integration, no deploy, no live mutation.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: controlled_upstream_api_forms_starter_integration_airstrip_frozen_no_deploy_no_mutation.

Completed at: 2026-07-07T16:55:17-04:00.

## V2.8.61H Carryforward

V2.8.61H pinned SDI-AI upstream main at `565a8afd669a42224a9d15759f7060faa375d000` and concluded that upstream added a real `apps/starter-app`, `apps/sample-app-2`, custom public form submit, admin FormDefinition/FormEntry routes, form designer/admin UX, FormBlock rendering, and model/package updates.

The V2.8.61H recommendation was followed: adopt/adapt/defer/reject, not blind merge.

## Airstrip Freeze

Airstrip remained frozen:

- no Airstrip source path was edited;
- no Airstrip route probes were run;
- no Airstrip responsive checks were run;
- no Airstrip deploy occurred;
- no Airstrip CMS, media, DomainBinding, appsetting, DNS, Bluehost, or custom-domain mutation occurred;
- no Airstrip contact POST or form submission occurred.

## Integration Summary

Adopted:

- `apps/starter-app/` imported as an additive local-only future tenant starter baseline from SDI-AI upstream.

Adapted:

- `apps/starter-app/PUMPKIN_ACTIVE_REPO_ADAPTER_NOTES.md` documents local boundaries and embedded `/admin` isolation.
- Starter form admin list now accepts both upstream `definitions` and active Pumpkin API `formDefinitions` response names.
- Starter form editor now emits active FormDefinition-required metadata while preserving upstream starter form-designer fields.
- `pumpkin-ts-models` now exports upstream-compatible form field names and optional starter compatibility fields without removing active FormDefinition fields.
- `pumpkin-block-views` now renders select options from both active string arrays and upstream `{ value, label }` option objects.

Deferred:

- `apps/sample-app-2/` source import.
- starter-app dependency install/type-check/build.
- starter app deploy or isolated runtime proof.
- customer-facing form submit proof.

Rejected:

- blind merge;
- replacing standalone Admin UI with starter embedded `/admin`;
- changing active DomainBinding, Backup, Intake, OperatorHandoff, ImportExecution, OutboundLinks, static-contact, or Airstrip systems.

## API And Forms Result

No Pumpkin API C# source was changed. Existing active API/form route contracts were preserved.

Source preservation checks passed:

- V2.8.48 FormDefinition API source checks.
- V2.8.53S external SDI-AI compatibility source checks.
- V2.8.60T DomainBinding source tests.
- V2.8.58C user profile/password route source tests.
- Pumpkin API Release build.

## Starter App Result

`apps/starter-app/` is now present as local source. It is not deployed and is not wired into Airstrip.

Starter dependencies were not installed because `apps/starter-app/node_modules` is absent and V2.8.61I forbids arbitrary new dependency installation. Safe static checks passed:

- starter JSON parse;
- starter JS config `node --check`;
- no Airstrip references in touched starter source.

## Non-Airstrip Runtime Result

GET-only runtime checks passed:

- Ice apex/www `/`, `/contact`, `/service-areas`: HTTP 200.
- Ice apex/www `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health`, `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.

No contact POST and no form submission occurred.

## Files Created Or Modified

Source/package:

- `apps/starter-app/`
- `packages/pumpkin-ts-models/src/forms.ts`
- `packages/pumpkin-ts-models/src/index.ts`
- `packages/pumpkin-ts-models/dist/index.d.ts`
- `packages/pumpkin-ts-models/dist/index.d.ts.map`
- `packages/pumpkin-ts-models/dist/index.js.map`
- `packages/pumpkin-block-views/src/views/FormBlockView.tsx`

Reports/docs:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61I_CONTROLLED_UPSTREAM_INTEGRATION_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-61i-controlled-upstream-integration-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_CONTROLLED_UPSTREAM_INTEGRATION_V2_8_61I.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_UPSTREAM_FORMS_STARTER_ADAPTATION_V2_8_61I.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_DOWNSTREAM_EXTENSION_PRESERVATION_V2_8_61I.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_FREEZE_AND_CUTOVER_HOLD_V2_8_61I.md`

Existing unrelated dirty files in the broader worktree were not reverted or staged.

## Commit Instructions

Use exact paths only:

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61I_CONTROLLED_UPSTREAM_INTEGRATION_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-61i-controlled-upstream-integration-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_CONTROLLED_UPSTREAM_INTEGRATION_V2_8_61I.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_UPSTREAM_FORMS_STARTER_ADAPTATION_V2_8_61I.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_DOWNSTREAM_EXTENSION_PRESERVATION_V2_8_61I.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_FREEZE_AND_CUTOVER_HOLD_V2_8_61I.md" `
  "apps/starter-app/" `
  "packages/pumpkin-ts-models/src/forms.ts" `
  "packages/pumpkin-ts-models/src/index.ts" `
  "packages/pumpkin-ts-models/dist/index.d.ts" `
  "packages/pumpkin-ts-models/dist/index.d.ts.map" `
  "packages/pumpkin-ts-models/dist/index.js.map" `
  "packages/pumpkin-block-views/src/views/FormBlockView.tsx"

git commit -m "Add V2.8.61I controlled upstream starter integration"
```
