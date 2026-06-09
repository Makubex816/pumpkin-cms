# Backup Job Worker Architecture

## Worker Principle

Backup Center must not generate large zips synchronously in a browser request. UI and CLI create jobs; workers perform exports in private temp storage and publish controlled artifacts.

## Core Records

| Record | Purpose |
| --- | --- |
| `BackupJob` | queued task with scope, mode, requester, status, approval references, and failure class |
| `BackupArtifact` | produced file or artifact pointer with checksum, size, storage class, expiry, and sensitivity |
| `BackupManifest` | structured manifest for backup contents and validation status |
| `BackupValidationResult` | validation checks, warnings, failures, and restore-readiness |
| `EscrowRequest` | elevated request for encrypted selected secrets |
| `EscrowRecipient` | approved public-key recipient metadata |
| `EscrowPayload` | encrypted escrow artifact metadata only |
| `EscrowRestoreRequest` | separate request to decrypt/restore escrow categories |
| `RestoreValidationResult` | restore-plan and sandbox-readback evidence |

## Job Status

- `queued`
- `running`
- `waiting-for-approval`
- `validating`
- `completed`
- `completed-with-warnings`
- `failed`
- `expired`
- `cancelled`

## Private Storage Flow

1. Create job and audit record.
2. Worker creates private temp workspace.
3. Worker gathers approved artifacts.
4. Worker creates manifest and checksums.
5. Worker validates bundle.
6. Worker writes final artifact to private backup storage.
7. Worker deletes temp workspace.
8. UI/CLI exposes status and controlled download.

## Retry Rules

- Retry transient reads and storage writes with bounded attempts.
- Do not retry approval failures, secret-scan failures, protected-path hits, or checksum mismatches without human review.
- Escrow failures fail closed.

## Artifact Expiration

Every job and artifact gets retention class, expiration timestamp, deletion status, and audit evidence for cleanup.
