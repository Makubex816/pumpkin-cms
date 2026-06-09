# Data Model Plan

## Core Objects

| Object | Key fields | Relationships |
| --- | --- | --- |
| `BackupScope` | `scopeType`, `tenantId`, `siteKey`, `includePlatform` | belongs to `BackupJob` and `BackupManifest` |
| `BackupJob` | `jobId`, `mode`, `scope`, `requestedBy`, `requestedAt`, `status`, `approvalRefs`, `failureClass` | owns artifacts, validation, audit events |
| `BackupArtifact` | `artifactId`, `jobId`, `kind`, `path`, `sha256`, `sizeBytes`, `storageClass`, `sensitivity`, `expiresAt` | listed in manifest |
| `BackupManifest` | `schemaVersion`, `backupId`, `mode`, `scope`, `createdAt`, `retention`, `artifacts`, `checksums`, `escrowIncluded` | validates bundle |
| `BackupFileEntry` | `path`, `kind`, `required`, `sensitivity`, `schemaRef` | used by manifest writer and validator |
| `BackupChecksum` | `path`, `sha256`, `algorithm` | belongs to manifest |
| `BackupValidationResult` | `validationId`, `backupId`, `status`, `checks`, `warnings`, `failures` | produced by validator |
| `EscrowRequest` | `requestId`, `scope`, `reason`, `categories`, `recipientFingerprints`, `status`, `approvalRefs` | may produce escrow payload later |
| `EscrowRecipient` | `recipientId`, `displayName`, `role`, `publicKeyFingerprint`, `algorithm`, `status`, `expiresAt` | selected by escrow request |
| `EscrowPayload` | `escrowId`, `backupId`, `encryptedPayloadPath`, `sha256`, `recipientFingerprints`, `status` | never stores plaintext |
| `EscrowRestoreRequest` | `restoreRequestId`, `escrowId`, `reason`, `target`, `status`, `approvalRefs` | separate from escrow creation |
| `RestoreValidationResult` | `validationId`, `backupId`, `target`, `status`, `checks` | follows restore-plan validation |
| `BackupAuditEvent` | `eventId`, `timestamp`, `actor`, `action`, `scope`, `jobId`, `artifactId`, `status`, `redactionStatus` | records activity |

## Controlled Statuses

| Area | Statuses |
| --- | --- |
| Backup job | `queued`, `running`, `succeeded`, `failed`, `blocked`, `awaiting_approval`, `approval_denied`, `expired` |
| Backup artifact | `planned`, `writing`, `available`, `quarantined`, `expired`, `deleted`, `blocked` |
| Validation | `not_run`, `running`, `passed`, `passed_with_warnings`, `validation_failed`, `blocked` |
| Escrow request | `requested`, `awaiting_approval`, `approved`, `approval_denied`, `expired`, `cancelled`, `blocked` |
| Restore validation | `not_run`, `running`, `restore_dry_run_complete`, `passed`, `validation_failed`, `blocked` |
| Retention | `active`, `expiring_soon`, `expired`, `delete_pending`, `deleted`, `cleanup_failed` |

## Lifecycle

1. Job is requested.
2. Scope is resolved.
3. Bundle is planned.
4. Files are written.
5. Manifest/checksums are written.
6. Validator runs.
7. Artifact is marked available or blocked.
8. Retention metadata controls expiration.
9. Audit events record every transition.
