# Phase 2B Import Package Builder Plan

This package plans the Import Package Builder / Wizard layer for Pumpkin CMS multi-tenant onboarding.

Phase 2B does not implement the builder. It defines how a guided form flow should help non-technical users create valid tenant import packages without hand-writing JSON.

## Why This Comes After The Validator

The Phase 2A validator checks whether an import package is safe and structurally valid. The Phase 2B builder should help users create that valid package in the first place, then run the validator before export and support handoff.

## Package Contents

- `PHASE_2B_SCOPE.md`
- `NON_GOALS.md`
- `USER_FLOW_OVERVIEW.md`
- `SCREEN_BY_SCREEN_BUILDER_SPEC.md`
- `FIELD_DEFINITION_CATALOG.md`
- `PACKAGE_GENERATION_MODEL.md`
- `SAVE_RESUME_MODEL.md`
- `VALIDATOR_INTEGRATION_MODEL.md`
- `SUPPORT_PACKET_EXPORT_MODEL.md`
- `ERROR_RECOVERY_AND_TROUBLESHOOTING_UX.md`
- `ACCESS_CONTROL_AND_ROLES.md`
- `AUDIT_LOGGING_MODEL.md`
- `IMPLEMENTATION_OPTIONS.md`
- `DATA_MODEL_DRAFT.md`
- `TEST_PLAN.md`
- `ACCEPTANCE_CRITERIA.md`
- `RISKS_AND_OPEN_DECISIONS.md`
- `NEXT_PHASE_2B1_IMPLEMENTATION_PROMPT.md`
- `manifest.json`

## Boundary

Planning only. No tenant creation, CMS writes, MediaAsset writes, Azure changes, Cloudflare changes, DNS changes, deployment, Function App setting changes, email/Microsoft 365 work, Search Console/indexing action, external checks, protected config reads, secret printing, or Roller work.
