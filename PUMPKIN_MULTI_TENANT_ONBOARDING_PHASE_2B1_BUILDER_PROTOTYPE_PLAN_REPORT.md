# Pumpkin Multi-Tenant Onboarding Phase 2B-1 Builder Prototype Plan Report

Generated: 2026-06-08

## Result

Planned the approved Phase 2B-1 local/offline import package builder prototype implementation.

Planning package:

```text
deployment/architecture/multi-tenant-onboarding-system/phase-2b1-builder-prototype-implementation-plan/
```

## What Was Planned

- answers JSON file model
- non-secret `answers.example.json`
- generated import package model
- module boundaries
- validator integration plan
- support packet integration plan
- CLI command plan
- test plan
- acceptance criteria
- risks and open decisions
- next implementation prompt

## Why Answers-File Prototype Comes First

The Phase 2B wizard plan describes a guided user experience. The first implementation step should be smaller: a local CLI builder that reads a structured answers JSON file. This creates a deterministic generation core that can later power prompts, an Admin UI wizard, or a hosted onboarding portal.

The answers-file prototype is easier to test because the same input should always generate the same import package files and validator results.

## Planned Future Command

```powershell
node src/builder-cli.mjs --answers answers.example.json --out .tmp/generated-package --validate --support-packet
```

This command is not implemented in this planning phase.

## Module Plan

Planned modules:

- `answers-loader`
- `answers-validator`
- `package-generator`
- `manifest-generator`
- `tenant-generator`
- `site-generator`
- `route-generator`
- `page-generator`
- `media-generator`
- `form-generator`
- `seo-generator`
- `theme-generator`
- `redirect-generator`
- `validator-runner`
- `support-packet-runner`
- `report-writer`
- `cli`

The builder should reuse the existing offline validator rather than reimplementing package validation.

## Test Plan Summary

Planned tests cover:

- valid answers generate a complete package
- missing required answers fail
- unsafe URL answers fail
- secret-looking answers fail and do not print values
- invalid routes fail
- missing media metadata fails
- missing form recipient fails
- generated package passes validator
- support packet is generated
- overwrite protection works
- `--dry-run` writes no package files
- no external calls occur

## Acceptance Criteria Summary

Future implementation is accepted only when:

- answers parsing and pre-generation validation exist
- deterministic package generation exists
- generated package runs through the existing offline validator
- support packet export works
- failures are safe and non-mutating
- tests and docs pass
- no external systems are touched

## What Was Not Implemented

No builder source code, CLI command, package generator, validator integration code, support packet integration code, real package output, tenant, import, deployment, or external integration was implemented.

## Start-State Classification

Latest relevant commits found:

- `43f323c` Plan multi-tenant import package builder
- `82025c2` Polish multi-tenant onboarding validator CLI
- `ad455ce` Implement multi-tenant onboarding validator skeleton
- `4a423aa` Plan multi-tenant onboarding validator implementation
- `94c3d07` Audit multi-tenant onboarding architecture

Worktree categories observed:

- expected current-scope additions: Phase 2B-1 planning package and this root report
- existing uncommitted architecture/wizard/intake/import-spec/validator docs from prior phases
- unrelated app and static-azure backlog changes
- raw content-review input folders
- generated/local validator artifacts ignored by package rules
- unexpected `tatus --short` file
- no protected config paths read or modified for this phase

## Readiness Classification

| Area | Status |
| --- | --- |
| Phase 2B builder/wizard plan | complete |
| Phase 2B-1 builder prototype implementation plan | yes |
| actual builder implementation | no |
| new tenant created | no |
| external systems changed | no |
| Search Console/indexing affected | no |
| Roller | paused |

## Boundary Confirmation

No tenant creation, CMS writes, MediaAsset writes, Azure changes, Cloudflare changes, DNS changes, deployment, Function setting changes, email/Microsoft 365 work, Search Console/indexing action, external checks, protected config reads, secret printing, generated artifact staging, raw content-review staging, or Roller work occurred.

## Validation

| Check | Result |
| --- | --- |
| Phase 2B-1 manifest JSON parse | Passed |
| `answers.example.json` parse | Passed |
| JSON parse for new JSON files | Passed, 2 files |
| `node --check` for changed JS/MJS | Not applicable; no JS/MJS implementation files were added in Phase 2B-1 scope |
| `git diff --check` | Passed with existing repository LF/CRLF warnings only |
| trailing whitespace scan on Phase 2B-1 docs | Passed, 16 files |
| protected/generated/raw scoped path check | Passed |
| targeted secret scan | Passed |
| CMS/MediaAsset/Azure/Cloudflare/DNS/deployment/Function/email/Microsoft 365/Search Console/indexing/Roller boundary | No actions performed |

## Next Recommendation

Use `NEXT_BUILDER_PROTOTYPE_IMPLEMENTATION_PROMPT.md` only when ready to implement the local/offline builder prototype. Keep tenant creation, Admin UI, external checks, Search Console/indexing, and all external mutations out of scope unless separately approved.
