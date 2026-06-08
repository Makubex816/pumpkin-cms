# Pumpkin Multi-Tenant Onboarding Phase 2B Import Builder Plan Report

Generated: 2026-06-08

## Result

Planned the approved Phase 2B Import Package Builder / Wizard layer.

Planning package:

```text
deployment/architecture/multi-tenant-onboarding-system/phase-2b-import-package-builder-plan/
```

## What Was Planned

- guided flow for non-technical users
- screen-by-screen builder specification
- field definition catalog with JSON path mapping
- deterministic package generation model
- save/resume model
- validator integration model
- support packet export model
- troubleshooting/error recovery UX
- access control and roles
- audit logging model
- implementation options and phased roadmap
- data model draft
- test plan
- acceptance criteria
- risks and open decisions
- next Phase 2B1 implementation prompt

## Why Builder/Wizard Comes After Validator

Phase 2A created the offline validator and support packet foundation. The validator answers "is this package valid and safe enough to continue?" Phase 2B plans the guided layer that helps users produce a good package before they ever need to understand or edit JSON.

The builder should generate package files and then use the Phase 2A validator as the readiness authority.

## User Flow

The planned flow:

1. Start new package or resume draft.
2. Confirm no-secrets and no-external-action boundaries.
3. Enter tenant identity.
4. Choose deployment profile.
5. Enter domains.
6. Build approved and forbidden route lists.
7. Add page placeholders.
8. Add media metadata.
9. Configure form recipient metadata.
10. Set SEO/canonical/sitemap policy with indexing hard stop.
11. Record legal/privacy/analytics/monitoring/rollback owners.
12. Preview generated package files.
13. Run offline validator.
14. Fix issues inline.
15. Export package if allowed.
16. Export support packet.
17. Hand off to operator for manual review.

Search Console/indexing remains a final blocked gate and is not part of package generation.

## Implementation Options

Options compared:

- docs/template-only flow
- CLI package builder
- Admin UI wizard
- hybrid CLI + UI
- hosted onboarding portal

Recommended phased approach:

1. Phase 2B1 CLI/package builder prototype.
2. Phase 2B2 Admin UI wizard.
3. Phase 2B3 support packet UI/export.
4. Phase 2B4 approval workflow integration.

## What Was Not Implemented

No implementation code was written. No builder, wizard, generator, CLI command, Admin UI, tenant package, tenant record, validator code, deployment automation, or external integration was implemented.

## Start-State Classification

Latest relevant commits found:

- `82025c2` Polish multi-tenant onboarding validator CLI
- `ad455ce` Implement multi-tenant onboarding validator skeleton
- `4a423aa` Plan multi-tenant onboarding validator implementation
- `94c3d07` Audit multi-tenant onboarding architecture

Worktree categories observed:

- expected current-scope additions: Phase 2B planning package and this root report
- existing uncommitted architecture/wizard/intake/import-spec/validator docs from prior phases
- unrelated app and static-azure backlog changes
- raw content-review input folders
- existing generated/local validator `.tmp/` outputs ignored by package rules
- unexpected `tatus --short` file
- no protected config paths read or modified for this phase

## Readiness Classification

| Area | Status |
| --- | --- |
| Phase 2A validator foundation | complete |
| Phase 2B builder/wizard plan | yes |
| implementation performed | no |
| new tenant created | no |
| external systems changed | no |
| Search Console/indexing affected | no |
| Roller | paused |

## Boundary Confirmation

No tenant creation, CMS writes, MediaAsset writes, Azure changes, Cloudflare changes, DNS changes, deployment, Function setting changes, email/Microsoft 365 work, Search Console/indexing action, external checks, protected config reads, secret printing, generated artifact staging, raw content-review staging, or Roller work occurred.

## Validation

| Check | Result |
| --- | --- |
| Phase 2B manifest JSON parse | Passed |
| JSON parse for new JSON files | Passed, 1 file |
| `node --check` for changed JS/MJS | Not applicable; no JS/MJS implementation files were added in Phase 2B scope |
| `git diff --check` | Passed with existing repository LF/CRLF warnings only |
| trailing whitespace scan on Phase 2B docs | Passed, 21 files |
| protected/generated/raw scoped path check | Passed |
| targeted secret scan | Passed |
| CMS/MediaAsset/Azure/Cloudflare/DNS/deployment/Function/email/Microsoft 365/Search Console/indexing/Roller boundary | No actions performed |

## Next Recommendation

Use `NEXT_PHASE_2B1_IMPLEMENTATION_PROMPT.md` only if the next approval should implement a local/offline CLI package builder prototype. Keep Admin UI, tenant creation, external checks, and external mutations out of scope unless separately approved.
