# Pumpkin Backup Export Restore Escrow Architecture Report

## Summary

Phase 2F-1 created a production-grade architecture/design package for Pumpkin Backup Center, backup export, restore validation, offline editing packages, and encrypted secret escrow.

This phase is architecture only. No implementation, backup export, database export, secret export, escrow payload creation, restore, CMS write, MediaAsset write, external platform mutation, protected config read, or live-page publication occurred.

## Why This Comes Before CMS Writes And UI

Backup Center is now a hard prerequisite before future CMS write/import execution, Roller static readiness execution, production readiness execution, live-page publication, or onboarding UI implementation. The system needs backup, rollback, restore validation, audit, retention, and encrypted recovery escrow controls before it increases write automation.

## Updated Milestone Model

The onboarding tracker has been re-baselined from 30 objectives to 45 objectives. Current state is 28 / 45 objectives completed, with Phase 2F active and Phase 2E Roller reconciliation/write path paused until Backup Center is implemented, validated, and owner-approved.

## What Was Created

Created `deployment/architecture/pumpkin-backup-export-restore/` with:

- standard backup bundle architecture;
- encrypted recovery escrow architecture;
- database/CMS/media/static export strategies;
- config inventory and redaction model;
- restore validation model;
- offline editing package model;
- Backup Center UI design;
- CLI/operator workflow;
- job worker model;
- access control and audit logging;
- retention/expiration policy;
- failure/recovery model;
- implementation roadmap;
- schema and template drafts with placeholders only.

## Standard Backup Model

Standard backups exclude secrets by default. They include manifest, checksums, summaries, validation results, restore instructions, database/CMS/media/static evidence, redacted config inventory, and an explicit `ESCROW_NOT_INCLUDED.md` marker.

## Encrypted Escrow Model

Encrypted escrow is a first-class main build flow. It requires separate recovery mode, elevated roles, explicit reason, allowlisted categories, approved recipient public keys, encryption before storage/download, audit logs, and separate restore approval.

Escrow excludes short-lived JWTs, browser sessions, auth headers, temporary signed URLs, one-time tokens, personal operator credentials, local paths, and private customer data by default.

## Restore Validation Model

Restore validation starts with manifest and checksum checks, then sandbox/local restore planning and readback verification. Production restore remains a separate future approval and is blocked if sandbox validation fails.

## UI CLI Operator Model

The design includes Backup Center screens for dashboard, standard backup creation, recovery escrow backup creation, job status, download, validation, restore dry-run, escrow restore request, audit log, and retention cleanup. CLI command designs cover backup creation, validation, restore plans, escrow creation, escrow restore planning, listing, cleanup, and support packets.

## Security Boundaries

- No standard backup secrets.
- No escrow without approval.
- No escrow restore without separate approval.
- No backup or escrow artifacts in public/static directories.
- No secret values in logs, reports, manifests, templates, or support packets.
- No generated backup/escrow artifacts staged into git.

## Implementation Roadmap

Phase 2F roadmap:

- 2F-1 architecture/design;
- 2F-2 backup manifest/schema/job model implementation plan;
- 2F-3 local standard backup exporter prototype;
- 2F-4 backup validator;
- 2F-5 encrypted escrow prototype;
- 2F-6 restore-to-local-sandbox plan/prototype;
- 2F-7 Admin Backup Center UI/backend job flow;
- 2F-8 access control/audit/retention implementation;
- 2F-9 end-to-end backup/restore/escrow QA drill;
- 2F-10 operational readiness and owner approval gate.

## Readiness Classification

| Area | Status |
| --- | --- |
| Updated 45-milestone model documented | yes |
| Backup/export/restore architecture package | yes |
| Encrypted escrow included in main build flow | yes |
| Implementation performed | no |
| Backup created | no |
| Secrets exported | no |
| Restore performed | no |
| CMS writes performed | no |
| External systems changed | no |
| Live pages affected | no |

## Validation

| Check | Result |
| --- | --- |
| Package manifest JSON parse | passed |
| Package manifest file list | passed, 44 files |
| Package JSON/schema/template parse | passed, 13 files |
| Changed JSON parse | passed, 17 files |
| `node --check` for changed `.js`/`.mjs` files | passed, 3 pre-existing changed files |
| `git diff --check` | passed with existing CRLF/LF conversion warnings only |
| Trailing whitespace scan | passed, 45 new package/report files |
| Secret value pattern scan | passed, 45 new package/report files |
| Staged paths | none |
| Staged guard hits | none |
| Protected/secret-risk changed path scan | passed |
| Backup zip created | no |
| Escrow payload created | no |
| Database export artifact created | no |
| Raw `content-review` staged | no |
| Ignored generated output staged | no |
| Protected config staged | no |

## Boundary Confirmation

- No implementation.
- No backup zip created.
- No escrow payload created.
- No database export.
- No protected config read.
- No secrets printed.
- No CMS writes.
- No MediaAsset writes.
- No POST, PUT, PATCH, or DELETE requests.
- No Azure, Cloudflare, DNS, deployment, Function App setting, email, Microsoft 365, Search Console, indexing, or live-page action.
- Live pages remain hard-stopped.
