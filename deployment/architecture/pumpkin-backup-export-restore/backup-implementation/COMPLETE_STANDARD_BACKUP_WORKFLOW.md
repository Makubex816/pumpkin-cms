# Complete Standard Backup Workflow

The Phase 2F-13 generator composes the existing Backup Center pieces into one operator command:

1. Create or collect the database proof.
2. Create or collect the media full-copy proof.
3. Build the standard folder bundle.
4. Add tenant website bundle evidence.
5. Add Resource Registry reference files.
6. Add operator summary and retention instructions.
7. Rebuild manifest and checksums.
8. Run `production-restore-proof` validation.
9. Generate a dry-run restore plan.
10. Rebuild manifest and checksums again.
11. Optionally write a downloadable ZIP under `.tmp`.
12. Run final validation reports.

## Local Fake Profile

```powershell
node src/backup-cli.mjs create-complete-standard --profile fake-complete --out .tmp/phase-2f13-unified-backup-generator/fake-complete --overwrite
```

This uses fixture content, fake Cosmos portable JSON, fake media text copies, redacted fixture config inventory, and local restore expected counts. It performs no network calls.

## Live-Readonly Ice Profile

```powershell
node src/backup-cli.mjs create-ice-complete-standard --profile live-readonly --out .tmp/phase-2f13-unified-backup-generator/ice-complete-standard --overwrite
```

This uses the approved read-only Ice Cosmos export runner and approved read-only media copy runner. The source proof outputs are written beside the final bundle under `<bundle>-source-proofs/`.

If Azure AD/RBAC read access is unavailable, the command fails or records the blocked source proof. It does not fall back to keys/listKeys, connection strings, SAS, protected config, or write-capable paths.

## Validation

Generated complete bundles are validated with:

```powershell
node src/backup-cli.mjs validate --bundle .tmp/phase-2f13-unified-backup-generator/fake-complete --mode production-restore-proof
```

The validator enforces manifest membership, checksum consistency, standard-mode escrow exclusion, protected path blocking, secret-like value scanning, complete Cosmos proof, complete media copy proof, and tenant website bundle presence.
