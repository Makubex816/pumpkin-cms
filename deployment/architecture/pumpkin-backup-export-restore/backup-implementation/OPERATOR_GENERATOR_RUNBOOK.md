# Operator Generator Runbook

## Preflight

Run from:

```powershell
deployment/architecture/pumpkin-backup-export-restore/backup-implementation
```

Confirm the working tree has no staged generated artifacts:

```powershell
git diff --cached --stat
```

Run local checks:

```powershell
npm run check
```

## Local Proof

```powershell
node src/backup-cli.mjs create-complete-standard --profile fake-complete --out .tmp/phase-2f13-unified-backup-generator/fake-complete --download --download-out .tmp/phase-2f13-unified-backup-generator/fake-download --overwrite
```

Review:

- `.tmp/phase-2f13-unified-backup-generator/fake-complete/manifest.json`
- `.tmp/phase-2f13-unified-backup-generator/fake-complete/VALIDATION_RESULT.md`
- `.tmp/phase-2f13-unified-backup-generator/fake-complete/operator/OPERATOR_SUMMARY.md`
- `.tmp/phase-2f13-unified-backup-generator/fake-complete/RESTORE_PLAN.md`
- `.tmp/phase-2f13-unified-backup-generator/fake-download/DOWNLOAD_PACKAGE_RESULT.md`

## Live-Readonly Proof

Run only under an approval that allows read-only Azure AD/RBAC Cosmos export and media copy:

```powershell
node src/backup-cli.mjs create-ice-complete-standard --profile live-readonly --out .tmp/phase-2f13-unified-backup-generator/ice-complete-standard --download --download-out .tmp/phase-2f13-unified-backup-generator/ice-download --overwrite
```

If RBAC is missing or propagation has not completed, stop and document the block. Do not switch to keys/listKeys, connection strings, SAS, protected config, write APIs, or CMS runtime changes.

## Cleanup

Generated outputs are disposable local artifacts. Remove them from `.tmp` when the review window closes. Do not stage bundles, source proofs, restore plans, or ZIP packages.

## Signoff Inputs

Owner signoff should review:

- final validation status;
- restore-plan dry-run status;
- Resource Registry reference status;
- media and Cosmos proof counts;
- generated download package status if requested;
- remaining Admin, Electron, escrow, and Outbound Link Manager gates.
