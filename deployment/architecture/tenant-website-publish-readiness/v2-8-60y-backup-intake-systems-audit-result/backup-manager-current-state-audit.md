# Backup Manager Current-State Audit

## Existing Assets

Documented and implemented assets include:

- V2.8.52A protected Ice tenant backup proof.
- `deployment/architecture/pumpkin-backup-export-restore/` architecture and runbooks.
- `backup-implementation/` local Node CLI prototype.
- Standard backup bundle writer.
- Manifest and checksum writer.
- Bundle validator and tamper detection.
- Restore dry-run planner.
- Fake/local adapters for CMS content, database plan, media inventory, static evidence, and redacted config inventory.
- Approved live-readonly Ice proof paths for Cosmos export and media copy.
- Resource Registry reference inclusion.
- Optional ignored local ZIP packaging.
- Fake encrypted escrow prototype, explicitly separate from standard backups.

## Proven Coverage

V2.8.52A proved an outside-repo protected Ice backup bundle containing:

- tenant summary with secret-like fields redacted;
- Pages: 3;
- MediaAssets: 9;
- media binaries: 9 blobs, 22,639,448 bytes;
- Themes: 1;
- FormDefinitions: 1;
- FormEntries: 4, protected/PII-bearing;
- ImportRuns: 1;
- PublishRuns: 1;
- redacted current actor/user identity evidence;
- tenant package summary;
- static publish snapshot summary;
- resource map summary;
- manifest and checksums.

## Current Access Pattern

Backup is not currently requested from a production UI or deployed service. It is run by a technical operator through controlled local/Codex workflows and approved secure handoffs.

## Current Restore Readiness

Restore readiness is partial:

- local restore dry-run validates structure, JSON, checksums, media hashes, and counts;
- live restore is not approved or implemented;
- identity restore, secret restore, FormEntry PII restore, media restore, static artifact replay, and live mutation policy remain separate gates.

## Current Database Coverage

Covered or source-available tenant domains:

- Tenant.
- User, currently partial/redacted for backup proof.
- Page.
- MediaAsset.
- Theme.
- FormDefinition.
- FormEntry.
- ImportRun.
- PublishRun.
- DomainBinding exists in current source and must be added to the backup contract as a required domain.

## Current Gaps

- No SuperAdmin Backup Manager screen.
- No BackupJob or BackupRun record model in production.
- No production backup API endpoints.
- No queue/worker execution model.
- No durable artifact storage target.
- No backup package download authorization model.
- No complete website/runtime file export contract.
- No original-upload package copy in backup proof.
- No normalized Pumpkin package copy in backup proof.
- No source patch/overlay copy in backup proof.
- No deployed runtime package or rebuildable artifact capture.
- No DomainBinding coverage in V2.8.52A protected bundle.
- No live restore adapter.

