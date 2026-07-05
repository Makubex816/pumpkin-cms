# Package Validator Update Result

Status: completed.

Updated:

`deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/validate-tenant-package.mjs`

Validator behavior:

- Checks `validation/responsive-routes.json` when present.
- Enforces the V2.8.60V viewport matrix.
- Enforces `/` and common conversion/service route coverage when those routes exist.
- Enforces `horizontalOverflow: true`, `formsNoSubmit: true`, `missingImages: zero`, and console/failed request expectations.
- Emits an error when `responsiveReadinessRequired` is true and the responsive file is missing.
- Emits a warning, not an error, for legacy packages that predate V2.8.60V and do not yet include the responsive file.

This preserves Airstrip package validation while giving future packages a hard responsive gate.
