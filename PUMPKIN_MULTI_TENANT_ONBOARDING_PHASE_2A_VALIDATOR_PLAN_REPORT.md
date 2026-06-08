# Pumpkin Multi-Tenant Onboarding Phase 2A Validator Plan Report

Generated: 2026-06-07

## Result

Created the Phase 2A multi-tenant onboarding validator implementation plan.

Package path:

```text
deployment/architecture/multi-tenant-onboarding-system/phase-2a-validator-implementation-plan/
```

This is implementation planning only. No validator source code, CLI commands, tenant creation, CMS writes, MediaAsset writes, Azure changes, Cloudflare changes, DNS changes, deployment, Function setting changes, email/Microsoft 365 work, Search Console/indexing action, protected config read, or Roller work occurred.

## Why Validator Foundation Comes First

The QA audit classified the architecture package as ready for implementation planning, not direct implementation. The largest blockers were cross-file validator design, URL safety rules, normalized gate statuses, deployment profile environment-variable classification, profile smoke-test fixtures, stricter extension permission/migration schema handling, and report contracts.

The validator foundation comes first because later CMS import, staging, deployment, and final indexing gates depend on trustworthy offline package validation.

## What Was Planned

Planned an offline intake/import validation engine that will eventually:

- validate tenant intake and import package structure
- parse JSON files
- load versioned schemas
- validate JSON Schema conformance
- validate cross-file references
- validate route allowlist and forbidden routes
- validate media references
- validate form references
- validate SEO/canonical/noindex/sitemap policy
- validate deployment profile references
- validate deployment profile environment-variable classification without reading protected config
- apply URL safety rules
- detect secret-looking values with redacted findings
- normalize gate statuses
- write `validation-report.json`
- write `VALIDATION_REPORT.md`

## Module Plan

Planned modules:

- `schema-loader`
- `package-discovery`
- `json-parse-validator`
- `schema-validator`
- `cross-file-reference-validator`
- `route-policy-validator`
- `media-reference-validator`
- `form-reference-validator`
- `seo-validator`
- `url-safety-validator`
- `secret-pattern-scanner`
- `gate-status-normalizer`
- `validation-report-writer`
- `cli-entrypoint`

These are module boundaries only. No modules were implemented.

## Test Plan

Planned fixture coverage:

- valid package fixture
- missing required field fixture
- bad route fixture
- missing media fixture
- forbidden local URL fixture
- unknown form fixture
- noindex fixture
- staging URL in production field fixture
- cross-tenant reference fixture
- paused tenant reference fixture
- secret-looking value fixture
- unsupported schema version fixture
- unknown deployment profile fixture
- deployment profile env-var classification fixture
- profile-specific offline smoke-test fixtures
- extension permission/migration handling fixtures
- non-technical error message snapshot tests

## Acceptance Criteria

Future Phase 2A implementation should not be accepted until:

- validator runs fully offline
- all schemas load
- valid example package passes
- invalid fixtures fail deterministically
- cross-file references are validated
- URL safety rules catch forbidden URLs
- deployment profile environment-variable classification is validated without reading protected config
- profile-specific smoke-test fixtures run offline
- extension permission and migration schema handling is validated or explicitly deferred with a blocking follow-up
- secret-looking values are redacted
- normalized gate statuses are used consistently
- validation reports are generated
- non-technical error messages are useful
- no external systems are touched
- no protected config is read
- no secrets are printed

## Start-State Classification

Start-state checks:

- latest relevant commit exists: `94c3d07 Audit multi-tenant onboarding architecture`
- architecture package and QA audit files were already modified in the worktree
- unrelated app source changes were present and left untouched
- unrelated static-azure backlog was present and left untouched
- raw `content-review` input folders were present and left untouched
- unexpected untracked file `tatus --short` was present and left untouched
- no protected config was read or printed
- no files were staged by this run

## Readiness Classification

| Area | Status |
| --- | --- |
| Phase 2A validator implementation plan created | yes |
| actual implementation performed | no |
| new tenant created | no |
| external systems changed | no |
| Search Console/indexing affected | no |
| Roller | paused |

## Boundary Confirmation

This planning run performed no CMS writes, no MediaAsset writes, no Azure changes, no Cloudflare changes, no DNS changes, no deployment, no Function setting changes, no email or Microsoft 365 work, no Search Console or indexing action, no protected config reads, no secret printing, no generated artifact staging, no raw content-review input staging, and no Roller work.

## Final Validation

| Check | Result |
| --- | --- |
| `manifest.json` parse | Passed |
| New JSON file parse | Passed, 1 JSON file |
| `node --check` for changed Phase 2A JS/MJS | Not applicable, no JS/MJS files created |
| `git diff --check` | Passed with repository line-ending warnings only |
| Trailing whitespace scan for Phase 2A package and root report | Passed |
| Protected/generated/raw path check for Phase 2A package and root report | Passed |
| Targeted secret-like value scan for Phase 2A package and root report | Passed |
| External system mutation check | No CMS, MediaAsset, Azure, Cloudflare, DNS, deployment, Function, email, Microsoft 365, Search Console, indexing, or Roller action performed |
| Implementation boundary check | No validator code, CLI command, tenant creation, or deployment implementation performed |
