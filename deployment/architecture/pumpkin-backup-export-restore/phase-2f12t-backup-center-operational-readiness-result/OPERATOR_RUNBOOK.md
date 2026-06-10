# Operator Runbook

Status: ready for owner review

This runbook separates local validation from future approval-only live regeneration.

## Local Validation Only

Backup Center package:

```powershell
cd deployment/architecture/pumpkin-backup-export-restore/backup-implementation
npm run check
```

Resource Registry package:

```powershell
cd deployment/architecture/pumpkin-backup-export-restore/resource-registry-implementation
npm run check
```

Check ignored output status:

```powershell
git status --short --ignored -- deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp deployment/architecture/pumpkin-backup-export-restore/resource-registry-implementation/.tmp
git diff --cached --stat
```

## Existing Proof Validation

The following commands are local validation/planning commands when the referenced `.tmp` proof folders already exist:

```powershell
cd deployment/architecture/pumpkin-backup-export-restore/backup-implementation
node src/backup-cli.mjs validate --bundle .tmp/phase-2f12s-complete-ice-standard-backup --mode production-restore-proof
node src/backup-cli.mjs restore-plan --bundle .tmp/phase-2f12s-complete-ice-standard-backup --out .tmp/phase-2f12s-restore-plan --expected-counts .tmp/phase-2f12s-complete-ice-standard-backup-expected-counts.json --mode production-restore-proof --overwrite
```

Do not stage the outputs.

## Future Approval-Only Regeneration

These commands perform live read operations and require separate future approval before use:

```powershell
cd deployment/architecture/pumpkin-backup-export-restore/backup-implementation
node src/backup-cli.mjs cosmos-export:live-readonly --out .tmp/phase-2f12r-live-cosmos-export --overwrite
node src/backup-cli.mjs media-copy:live-readonly --out .tmp/phase-2f12s-media-blob-copy --overwrite
node src/backup-cli.mjs create-ice-complete-standard-backup --export .tmp/phase-2f12r-live-cosmos-export --media .tmp/phase-2f12s-media-blob-copy --out .tmp/phase-2f12s-complete-ice-standard-backup --overwrite
```

Approval must explicitly allow the live read/export/download portions before those commands are run.

## Secure Handoff Handling

- Keep encrypted handoff and vault outputs under ignored `.tmp` until owner retention is decided.
- Do not print, decrypt, or paste vault payloads into tickets, commits, prompts, or docs.
- Do not include session JWTs in durable escrow.
- Refresh the handoff when resource inventory or credential references materially change.

## Actions Requiring Future Approval

- Cosmos writes or seed retry.
- New live Cosmos export.
- New media/blob download.
- CMS runtime switch.
- CMS writes or MediaAsset writes.
- Live restore rehearsal.
- Deployment, DNS, Cloudflare, Function App setting changes, Search Console/indexing, or live-page publication.
- Admin UI implementation, Electron implementation, and Outbound Link Manager implementation.
