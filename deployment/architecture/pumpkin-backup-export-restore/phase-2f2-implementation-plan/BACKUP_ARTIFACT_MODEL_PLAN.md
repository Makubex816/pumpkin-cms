# Backup Artifact Model Plan

## Artifact Record

`BackupArtifact` represents one produced or planned file.

Required fields:

- `artifactId`
- `jobId`
- `path`
- `kind`
- `sha256`
- `sizeBytes`
- `storageClass`
- `sensitivity`
- `createdAt`
- `expiresAt`
- `downloadAllowed`

## Artifact Kinds

- `manifest`
- `checksum`
- `summary`
- `validation-result`
- `restore-instructions`
- `cms-content`
- `database-plan`
- `media-inventory`
- `static-evidence`
- `config-inventory`
- `escrow-marker`
- `audit-log`

## Sensitivity

- `redacted`: safe summary or placeholder content.
- `sensitive`: backup artifact that may contain tenant content or operational evidence.
- `encrypted`: encrypted escrow or encrypted database export reference.

## Phase 2F-3 Rule

Phase 2F-3 should produce folder-based artifacts only, not zip archives. It should write `ESCROW_NOT_INCLUDED.md` for standard backups and never create `encrypted-secrets.*`.

## Retention Link

Every artifact inherits job retention and can be independently marked `available`, `quarantined`, `expired`, or `deleted`.
