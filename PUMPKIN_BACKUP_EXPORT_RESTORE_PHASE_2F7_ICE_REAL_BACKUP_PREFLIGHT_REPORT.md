# Pumpkin Backup Export Restore Phase 2F-7 Ice Real Backup Preflight Report

Generated: 2026-06-08

## Scope

Phase 2F-7 created a preflight package for the first real Backup Center validation target: IceSkatingRinkRentals.com full website plus database standard backup.

Package path:

```text
deployment/architecture/pumpkin-backup-export-restore/phase-2f7-ice-real-backup-preflight/
```

This was documentation and planning only.

## Start-State Review

Recent Backup Center commits were present:

- `f746d16 Add Backup Center fake encrypted escrow prototype`
- `db79cb5 Add Backup Center restore validation dry run`
- `a92334f Harden Backup Center validator`
- `b6e8632 Implement local Backup Center standard exporter prototype`
- `e639016 Plan Backup Center implementation`
- `0bd9751 Design Pumpkin Backup Center architecture`

Worktree classification at start:

| Classification | Status |
| --- | --- |
| Phase 2F-7 package | did not exist before this task |
| staged files | none |
| unrelated onboarding/static backlog | pre-existing modified files outside this package, left untouched |
| raw content-review folders | pre-existing untracked `content-review/ice-final-contact-input/` and `content-review/ice-service-areas-input/`, left untouched |
| ignored generated output | not staged |
| protected/secret risk paths | no protected config files were read or modified |

## What Was Planned

The package defines:

- exact Ice backup target profile;
- full website plus database standard backup scope;
- CMS content export plan;
- database export/evidence plan;
- media/blob inventory and optional copy plan;
- static evidence plan;
- config inventory and redaction plan;
- standard-backup secret exclusion rules;
- optional encrypted escrow approval boundary;
- restore validation preflight;
- env presence check plan;
- operator checklist;
- go/no-go criteria;
- next Ice full backup execution prompt.

## Why Ice Is First

IceSkatingRinkRentals.com is the completed live tenant with known route, media, form, static, and production readiness evidence. It remains hard-stopped before Search Console/indexing pending final owner approval, making it the right first real Backup Center proof target before higher-risk future work resumes.

## Backup Scope Summary

Future execution should create a tenant-scoped standard backup for `ice-rink-rentals` including CMS tenant/site/page/route/form/SEO/redirect/theme data, MediaAsset metadata, approved media inventory/copies, static evidence, redacted config inventory, checksums, manifest, validation result, restore instructions, and approved database backup evidence or encrypted export artifact.

Approved live routes are `/`, `/contact`, and `/service-areas`. Known obsolete routes `/ice-rink-rentals` and `/events-holiday-activations` should remain 404 evidence, not live route recreation targets.

## Standard-Backup Secret Exclusions

The standard backup must exclude raw API keys, JWTs, auth headers, cookies, Azure tokens, Cloudflare tokens, Microsoft Graph secrets, storage keys, connection strings, SMTP passwords, deployment tokens, protected config contents, and encrypted escrow payloads.

The standard bundle must include `escrow/ESCROW_NOT_INCLUDED.md` and a redacted config inventory with names and `PRESENT`/`MISSING` style states only.

## Optional Escrow Boundary

Real encrypted escrow remains no-go. Any future recovery escrow requires separate owner approval, recipient/key-management readiness, allowlisted categories, audit records, retention rules, and encrypted output storage. Short-lived JWTs and session cookies are excluded by default.

## Database, CMS, Media, Static, And Restore Plans

| Area | Planned Future Scope |
| --- | --- |
| Database | Azure SQL platform backup evidence or encrypted BACPAC/export artifact after separate approval |
| CMS | read/export tenant, site, pages, routes, forms, SEO, redirects, theme/settings, MediaAsset metadata |
| Media | MediaAsset metadata, public URL inventory, blob inventory, optional approved copy/download with checksums |
| Static evidence | route proof, obsolete-route 404 proof, sitemap/robots/canonical/noindex evidence, validators, form/media proof |
| Restore validation | manifest parse, checksum verify, content/database/media/static/config validation, dry-run restore plan only |

## Readiness Classification

| Area | Status |
| --- | --- |
| Phase 2F-6 encrypted escrow fake prototype | complete |
| Phase 2F-7 Ice real backup preflight | yes |
| Ready for Ice full standard backup execution approval | yes, conditional |
| Ready for real escrow execution | no |
| Backup created | no |
| Database export performed | no |
| CMS/API calls performed | no |
| Protected config read | no |
| Real secrets exported | no |
| Restore performed | no |
| External systems changed | no |
| Live pages affected | no |

## Recommendation

Conditional go for a later Ice full standard backup execution approval decision.

The future approval must resolve env presence, output/storage target, database export mode, database artifact encryption, media inventory/copy/download mode, external evidence checks, retention, and cleanup. It must continue to forbid CMS writes, real escrow, deployment, Search Console/indexing, and live-page publication unless separately approved.

## Boundary Confirmation

No real backup export, backup bundle from live Ice data, production backup zip, database export, SQL BACPAC export, CMS/API call, CMS write, MediaAsset write, blob download, static output export, protected config read, secret export, escrow payload, restore, Azure change, Cloudflare change, DNS change, deployment, Function setting change, email/Microsoft 365 work, Search Console/indexing action, Admin UI implementation, or live-page publication occurred.

## Final Validation

| Check | Result |
| --- | --- |
| manifest JSON parse | passed |
| changed JSON parse | passed, 1 file |
| node `--check` for changed JS/MJS | not applicable |
| scoped `git diff --check` | passed |
| trailing whitespace scan | passed, 20 scoped files |
| protected/generated/raw artifact path check | passed |
| value-level secret scan | passed |
| external command pattern scan | passed |
| backup/export/escrow artifact check | passed |
| staged file check | passed, 0 staged paths |

No backup zip, real backup bundle, database export, escrow payload, protected config read, real secret print, CMS/API call, CMS write, MediaAsset write, database import/export, Azure change, Cloudflare change, DNS change, deployment, Function setting change, email/Microsoft 365 work, Search Console/indexing action, or live-page publication occurred.
