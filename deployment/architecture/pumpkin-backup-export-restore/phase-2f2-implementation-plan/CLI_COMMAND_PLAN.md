# CLI Command Plan

## Future Commands

```text
pumpkin backup create
pumpkin backup validate
pumpkin backup restore-plan
pumpkin backup escrow-create
pumpkin backup escrow-restore-plan
pumpkin backup list
pumpkin backup cleanup-expired
```

## Phase 2F-3 Local Commands

Phase 2F-3 should implement only local standard mode:

```text
node src/cli.mjs create --scope tenant --tenant example-tenant --out .tmp/example-tenant-standard
node src/cli.mjs validate --backup .tmp/example-tenant-standard
node src/cli.mjs restore-plan --backup .tmp/example-tenant-standard --target local
```

## Escrow Command Staging

Escrow commands should exist as planned shapes first and fail safely until Phase 2F-5:

```text
node src/cli.mjs escrow-create --help
node src/cli.mjs escrow-restore-plan --help
```

If invoked before approval and implementation, they should return a clear blocked status.

## CLI Boundaries

- No env secret values printed.
- No protected config reads.
- No external calls.
- `.tmp` output only.
- Explicit `--overwrite` required for replacing local output.
- Standard mode always writes `ESCROW_NOT_INCLUDED.md`.
