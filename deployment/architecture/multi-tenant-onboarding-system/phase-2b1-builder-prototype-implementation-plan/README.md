# Phase 2B-1 Builder Prototype Implementation Plan

This package defines the first local/offline import package builder prototype. It is a plan only; no builder source code is implemented here.

## Prototype Goal

The future prototype should read a non-secret answers JSON file, generate a tenant import package folder, run the existing offline validator, and export validator reports plus a support packet.

## Planned Flow

1. Load answers JSON.
2. Validate answers before generation.
3. Generate deterministic import package files.
4. Run the existing offline validator against the generated package.
5. Fail safely if validation fails.
6. Export validation reports and support packet.
7. Exit with clear status codes and local-only boundary messaging.

## Package Files

- `IMPLEMENTATION_SCOPE.md`
- `NON_GOALS.md`
- `BUILDER_INPUT_ANSWERS_MODEL.md`
- `answers.example.json`
- `GENERATED_IMPORT_PACKAGE_MODEL.md`
- `MODULE_BOUNDARIES.md`
- `VALIDATOR_INTEGRATION_PLAN.md`
- `SUPPORT_PACKET_INTEGRATION_PLAN.md`
- `CLI_COMMAND_PLAN.md`
- `TEST_PLAN.md`
- `ACCEPTANCE_CRITERIA.md`
- `RISKS_AND_OPEN_DECISIONS.md`
- `NEXT_BUILDER_PROTOTYPE_IMPLEMENTATION_PROMPT.md`
- `manifest.json`

## Boundary

Planning only. No tenant creation, CMS writes, MediaAsset writes, Azure changes, Cloudflare changes, DNS changes, deployment, Function App setting changes, email/Microsoft 365 work, Search Console/indexing action, external checks, protected config reads, secret printing, or Roller work.
