# Backup Generator

Phase 2F-13 productizes the local Backup Center prototype into a repeatable standard backup generator workflow for Ice.

The generator is still a local CLI workflow. It writes standard backup folder bundles under ignored `.tmp` output, validates the bundle, writes a dry-run restore plan, adds operator-facing summaries, records a redacted Resource Registry reference, and can optionally create a downloadable ZIP copy under ignored `.tmp`.

## Commands

Local fake proof:

```powershell
node src/backup-cli.mjs create-complete-standard --profile fake-complete --out .tmp/phase-2f13-unified-backup-generator/fake-complete --download --download-out .tmp/phase-2f13-unified-backup-generator/fake-download --overwrite
```

Approved live-readonly Ice proof:

```powershell
node src/backup-cli.mjs create-ice-complete-standard --profile live-readonly --out .tmp/phase-2f13-unified-backup-generator/ice-complete-standard --download --download-out .tmp/phase-2f13-unified-backup-generator/ice-download --overwrite
```

Package an existing validated bundle:

```powershell
node src/backup-cli.mjs package-download --bundle .tmp/phase-2f13-unified-backup-generator/fake-complete --out .tmp/phase-2f13-unified-backup-generator/fake-download --overwrite
```

## What It Produces

The generated standard bundle includes the normal backup content plus product files:

- `resource-registry/resource-registry-reference.json`
- `resource-registry/RESOURCE_REGISTRY_REFERENCE.md`
- `operator/generator-result.json`
- `operator/OPERATOR_SUMMARY.md`
- `operator/RETENTION_AND_CLEANUP.md`
- `RESTORE_PLAN.md`
- `VALIDATION_RESULT.json`
- `VALIDATION_RESULT.md`
- `validation-result.json`

The restore dry-run output is written beside the bundle as `<bundle>-restore-plan/`. Optional download output is written beside the bundle or to `--download-out`.

## Resource Registry Inclusion

The generator includes a reference to the redacted Resource Registry evidence and 12T readiness package. It does not embed encrypted vault payloads, escrow artifacts, secret values, protected config, JWTs, connection strings, SAS values, storage keys, or Azure access tokens.

## Boundary

The fake profile is offline and fixture-only. The live-readonly profile may use the approved Azure AD/RBAC read-only Cosmos export and media copy paths. Neither profile performs CMS writes, Cosmos writes, storage mutation, CMS runtime switching, deployment, indexing, live-page publication, protected config reads, keys/listKeys, connection string reads, or SAS generation.
