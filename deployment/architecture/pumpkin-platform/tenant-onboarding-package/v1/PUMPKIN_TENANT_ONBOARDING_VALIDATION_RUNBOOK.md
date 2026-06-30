# Pumpkin Tenant Onboarding Validation Runbook

## Inputs

- Public tenant package directory.
- Optional secure handoff path for later phases only.

## Local Validation

1. Confirm the package is outside `.tmp` unless it is generated runtime evidence.
2. Run the V1 validator against the package directory.
3. Review `.tmp/tenant-onboarding/<tenantId>/validation-summary.json`.
4. Resolve blocking errors before asking for any live write approval.

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
- Public package secret scan passes.

## Outputs

- Validator summary JSON under `.tmp/tenant-onboarding/`.
- Human-readable result package in the active phase report.

## Hard Stops

- Any secret-like public value.
- Missing tenant identity.
- Missing required baseline routes.
- Any attempted live write without explicit approval.
