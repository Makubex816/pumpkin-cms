# Restore Validation Plan

## Purpose

Restore validation proves that a backup bundle is structurally restorable before any real restore is considered.

## Phase 2F-3/2F-4 Scope

Early restore validation should:

- validate bundle first;
- verify checksums;
- read manifest scope;
- simulate restore plan;
- compare expected file counts;
- compare CMS content export counts where local fixtures exist;
- verify media inventory shape;
- verify redacted config inventory;
- confirm standard backup has no escrow payload;
- write dry-run result only.

## Future Sandbox Scope

Phase 2F-6 may add restore-to-local-sandbox prototype. It should not restore production data or secrets without separate approval.

## Escrow Restore Separation

Escrow restore planning is separate from standard restore validation. It requires escrow artifact validation, recipient authorization, restore approval, and fake-secret fixtures before any real secret restore is considered.

## Output

Future output:

- `RESTORE_PLAN.md`
- `RESTORE_VALIDATION.json`
- `RESTORE_VALIDATION.md`

## Abort Conditions

Abort if manifest/schema/checksum validation fails, protected paths appear, standard backup contains escrow payloads, or target environment is production without explicit later approval.
