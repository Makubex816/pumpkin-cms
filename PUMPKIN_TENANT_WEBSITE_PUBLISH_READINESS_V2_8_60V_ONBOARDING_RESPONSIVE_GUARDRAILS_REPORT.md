# Pumpkin Tenant Website Publish Readiness V2.8.60V Onboarding Responsive Guardrails Report

Phase status: completed with responsive replay blocker recorded.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: tenant_onboarding_mobile_responsive_guardrails_package_conversion_output_checks_no_mutation.

## V2.8.60R Carryforward

The V2.8.60R Airstrip responsive repair findings were preserved:

- active Airstrip `globals.css` missed mobile nav collapse rules from original static CSS;
- `.as-nav-right` kept full desktop nav/CTA visible on mobile;
- fixed/min-width grids and sections lacked scoped responsive constraints;
- failures included horizontal overflow, clipped request button, clipped hero/section content, and sideways mobile layout;
- durable repair reference remains `deployment/airstrip/patches/v2-8-60r-mobile-responsive/`;
- V2.8.60R reported local, isolated, and production responsive proof passing 28/28.

## Root-Cause Standardization

Airstrip was folded into the platform as a warning pattern, not as a global class-name rule. Future conversions must compare original/source CSS to active converted CSS when both exist, verify nav collapse, constrain fixed/min-width sections, preserve tappable CTAs, and run browser-level horizontal overflow checks before cutover.

Durable docs created:

- `deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_ONBOARDING_RESPONSIVE_GUARDRAILS_V2_8_60V.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PACKAGE_CONVERSION_MOBILE_QA_STANDARD_V2_8_60V.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_RESPONSIVE_ROOT_CAUSE_CARRYFORWARD_V2_8_60V.md`

## Package Contract Updates

Updated tenant onboarding package contract docs, schema, templates, and validator:

- `responsiveReadinessRequired` added as the forward-looking enforcement flag.
- Optional `responsive` module support added to package schema.
- New `validation/responsive-routes.json` schema added.
- Blank and Ice example packages now include responsive route templates.
- Runbooks now require responsive proof before isolated proof, production default-host proof, custom-domain cutover, DNS, or indexing.

## Responsive Checker

Created:

`deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/check-responsive-output.mjs`

The checker accepts a base URL plus routes or a route file, runs the V2.8.60V viewport matrix, detects horizontal overflow, records console errors, failed requests, bad responses, missing images, and navigation status, and writes JSON proof. It does not submit forms. Screenshots are opt-in only.

## Validator and Template Results

Validator replay:

- Blank template: valid, 0 errors, 1 expected blank-media warning.
- Ice example: valid, 0 errors, 0 warnings.
- Airstrip normalized package: valid, 0 errors, 1 V2.8.60V warning because legacy package lacks `validation/responsive-routes.json`.

The validator remains compatible with the existing Airstrip normalized package while enforcing responsive declarations for packages marked `responsiveReadinessRequired: true`.

## Responsive Proof Replay

The new checker ran against:

`https://app-airstrip-prod-centralus-001.azurewebsites.net`

Routes:

- `/`
- `/request-booking`
- `/packages`
- `/airstrip-the-club`

Result:

- checks: 28
- navigation failures: 0
- console errors: 0
- failed requests: 0
- bad responses: 0
- missing images: 0
- overflow failures: 5

All overflow failures were on `/airstrip-the-club` mobile viewports. Read-only element probe identified `.as-club-info` blocks extending beyond viewport width.

Classification: airstrip_production_default_host_responsive_overflow_replay_blocker.

No source fix or deploy was performed because V2.8.60V does not approve source changes or live mutation.

## Runtime No-Regression

GET-only runtime route health passed:

- Ice apex/www `/`, `/contact`, `/service-areas`, `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health`, `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`: HTTP 200.
- Airstrip production default host `/`, `/request-booking`, `/packages`, `/airstrip-the-club`: HTTP 200.

## Security Boundary

Confirmed no live mutation, deploy, DNS/custom-domain action, indexing, contact POST, form submission, media upload/delete, Airstrip/Ice content mutation, storage key/listKeys, SAS generation, connection string generation, Key Vault secret query, or secret printing occurred.

No `.tmp` files or screenshots were staged.

## Files Created or Modified

Created:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60V_ONBOARDING_RESPONSIVE_GUARDRAILS_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-60v-onboarding-responsive-guardrails-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_ONBOARDING_RESPONSIVE_GUARDRAILS_V2_8_60V.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PACKAGE_CONVERSION_MOBILE_QA_STANDARD_V2_8_60V.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_RESPONSIVE_ROOT_CAUSE_CARRYFORWARD_V2_8_60V.md`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/schemas/responsive-routes.schema.json`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/check-responsive-output.mjs`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/blank-tenant-template/validation/responsive-routes.json`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/ice-rink-rentals/validation/responsive-routes.json`

Modified:

- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/PUMPKIN_TENANT_ONBOARDING_PACKAGE_SPEC_V1.md`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/PUMPKIN_TENANT_ONBOARDING_VALIDATION_RUNBOOK.md`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/PUMPKIN_TENANT_ONBOARDING_EXECUTION_RUNBOOK.md`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/README.md`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/schemas/tenant-package.schema.json`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/validate-tenant-package.mjs`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/blank-tenant-template/tenant-package.json`
- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/ice-rink-rentals/tenant-package.json`

## Validation

Final validation status is recorded in:

`deployment/architecture/tenant-website-publish-readiness/v2-8-60v-onboarding-responsive-guardrails-result/validation-summary.md`

## Next Approval

Next approval is folded into:

`deployment/architecture/tenant-website-publish-readiness/v2-8-60v-onboarding-responsive-guardrails-result/next-phase-prompt.md`

It proposes V2.8.60W Airstrip `/airstrip-the-club` mobile overflow repair and re-proof, with DNS/custom-domain and indexing still out of scope.

## Exact-Path Commit Instructions

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_60V_ONBOARDING_RESPONSIVE_GUARDRAILS_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-60v-onboarding-responsive-guardrails-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_ONBOARDING_RESPONSIVE_GUARDRAILS_V2_8_60V.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_PACKAGE_CONVERSION_MOBILE_QA_STANDARD_V2_8_60V.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_RESPONSIVE_ROOT_CAUSE_CARRYFORWARD_V2_8_60V.md" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/PUMPKIN_TENANT_ONBOARDING_PACKAGE_SPEC_V1.md" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/PUMPKIN_TENANT_ONBOARDING_VALIDATION_RUNBOOK.md" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/PUMPKIN_TENANT_ONBOARDING_EXECUTION_RUNBOOK.md" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/README.md" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/schemas/tenant-package.schema.json" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/schemas/responsive-routes.schema.json" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/validate-tenant-package.mjs" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/check-responsive-output.mjs" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/blank-tenant-template/tenant-package.json" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/blank-tenant-template/validation/responsive-routes.json" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/ice-rink-rentals/tenant-package.json" `
  "deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/ice-rink-rentals/validation/responsive-routes.json"

git diff --cached --check
git commit -m "Add V2.8.60V responsive onboarding guardrails"
```
