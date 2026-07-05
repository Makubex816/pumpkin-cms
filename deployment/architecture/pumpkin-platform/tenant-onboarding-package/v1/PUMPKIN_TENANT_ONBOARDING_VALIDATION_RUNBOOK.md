# Pumpkin Tenant Onboarding Validation Runbook

## Inputs

- Public tenant package directory.
- Optional secure handoff path for later phases only.

## Local Validation

1. Confirm the package is outside `.tmp` unless it is generated runtime evidence.
2. Run the V1 validator against the package directory.
3. Review `.tmp/tenant-onboarding/<tenantId>/validation-summary.json`.
4. Run responsive output proof after a converted static output or preview URL exists.
5. Resolve blocking errors before asking for any live write approval.

## Required Checks

- Required files exist for `full-template` packages.
- Required modules are declared.
- JSON files parse.
- Tenant IDs are consistent.
- Baseline pages exist.
- Media manifest entries have non-empty file references when entries are declared.
- Users have `passwordSource` and no password.
- Forms have fields and no secret-like values.
- Validation expected routes exist.
- Responsive route and viewport declarations exist for packages converted or updated after V2.8.60V.
- Responsive declarations include horizontal overflow detection, no form submission, zero missing images, and the required viewport matrix.
- Public package secret scan passes.

## Responsive Output Check

Use the reusable checker after package conversion produces a local, isolated, or production default-host preview:

```powershell
node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/check-responsive-output.mjs `
  --base-url https://example-preview-host `
  --routes-file deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/blank-tenant-template/validation/responsive-routes.json `
  --out .tmp/tenant-onboarding/<tenantId>/responsive-proof.json
```

The checker is browser/GET-only. It must not be used to submit forms. Screenshots are disabled by default and should remain outside the repo if enabled for manual visual review.

## Outputs

- Validator summary JSON under `.tmp/tenant-onboarding/`.
- Human-readable result package in the active phase report.

## Hard Stops

- Any secret-like public value.
- Missing tenant identity.
- Missing required baseline routes.
- Missing required responsive declaration on a new or updated package.
- Any responsive proof with horizontal overflow, missing images, failed navigation, unexpected failed requests, or unexpected console errors.
- Any attempted live write without explicit approval.
