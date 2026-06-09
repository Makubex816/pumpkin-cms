# Executive Summary

Pumpkin needs a Backup Center before it safely resumes CMS write/import execution or adds onboarding UI workflows. The Backup Center gives operators a reliable way to capture tenant/platform state, validate restorability, and prepare recovery evidence before risky changes.

The design has two first-class flows:

1. Standard backups, which contain operationally useful database/content/media/static/config inventory evidence but exclude secrets.
2. Recovery escrow backups, which attach a separate encrypted escrow payload containing selected allowlisted secrets only after elevated approval.

Encrypted escrow is part of the main build flow because practical recovery often needs selected runtime credentials, but those credentials must never leak into normal backups, support packets, logs, static output, or git.

## Architecture Decision

Backup Center is inserted before:

- future CMS import/write execution;
- Roller static readiness execution;
- production readiness execution;
- live-page publication;
- onboarding UI implementation.

## Milestone Impact

The onboarding tracker is re-baselined from 30 objectives to 45 objectives. Phase 2F is the new active foundation track, with Phase 2E Roller reconciliation/write path paused until Backup Center is implemented, validated, and owner-approved.

## Key Safety Rules

- No standard backup includes secret values.
- No escrow payload exists unless the operator chooses recovery escrow mode and the approval gate passes.
- Short-lived JWTs, browser sessions, auth headers, temporary signed URLs, one-time tokens, personal operator credentials, and private customer data are excluded by default.
- Restore validation happens in sandbox/local first.
- Download, validation, restore planning, escrow creation, and escrow restore are separately audited.
