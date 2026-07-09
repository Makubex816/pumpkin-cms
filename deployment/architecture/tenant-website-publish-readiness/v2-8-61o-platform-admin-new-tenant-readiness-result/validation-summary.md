# Validation Summary

Status: completed with Admin build validation gaps.

## Passed

- Required result files exist.
- Durable docs exist.
- Owner input template exists under ignored `.tmp` and is not staged.
- JSON parse passed for `result-manifest.json`.
- JSON parse passed for `.tmp/v2-8-61o/owner-input/new-tenant-intake-owner-values.json`.
- Scoped `git diff --check` returned no output.
- Scoped trailing whitespace scan passed.
- High-confidence secret-like scan passed.
- Disallowed executable command-shaped scan passed.
- Protected-path command guard passed.
- Node syntax check for changed JS/MJS files: not applicable; no JS/MJS files changed in V2.8.61O scope.
- Non-Airstrip runtime no-regression proof passed 13/13.
- No cleanup execution occurred.
- No live mutation occurred.
- No deploy occurred.
- No DNS/custom-domain action occurred.
- No contact/form/customer-facing POST occurred.
- No Airstrip disturbance occurred.
- No `.tmp` or node_modules files are staged.
- No files are staged at end.

## Failed

`npm run type-check` in `apps/admin` failed with existing diagnostics outside the new `/dashboard/leads` alias:

- `src/app/dashboard/form-builder/page.tsx`: `spamProtection` is missing `StarterFormSpamProtection` fields.
- `src/app/dashboard/form-builder/page.tsx`: a default text field is missing required `attributes`.
- `src/app/dashboard/themes/[id]/page.tsx`: default theme object is missing required `Theme` fields.

`npm run build` in `apps/admin` failed:

- App code compiled with existing lint warnings.
- Build then failed type checking on the same form-builder `spamProtection` diagnostic.
- Build also reported the existing browser bundle issue where `pumpkin-ts-models/dist/PageJsonConverter.js` imports `fs`.

## Scoped Git Status

```text
?? PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61O_PLATFORM_ADMIN_NEW_TENANT_READINESS_REPORT.md
?? apps/admin/src/app/dashboard/leads/page.tsx
?? deployment/architecture/pumpkin-platform/PUMPKIN_ADMIN_UI_GAP_CLOSURE_V2_8_61O.md
?? deployment/architecture/pumpkin-platform/PUMPKIN_NEW_TENANT_INTAKE_READINESS_V2_8_61O.md
?? deployment/architecture/pumpkin-platform/PUMPKIN_PLATFORM_STATE_REANALYSIS_V2_8_61O.md
?? deployment/architecture/pumpkin-platform/PUMPKIN_SAFE_NEXT_BUILD_MAP_V2_8_61O.md
?? deployment/architecture/tenant-website-publish-readiness/v2-8-61o-platform-admin-new-tenant-readiness-result/
```
