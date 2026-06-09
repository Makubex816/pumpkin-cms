# CLI Result

The CLI now supports:

```powershell
node src/backup-cli.mjs escrow-create-fake --request fixtures/fake-escrow-request.json --out .tmp/fake-escrow --overwrite
node src/backup-cli.mjs escrow-validate --escrow .tmp/fake-escrow
node src/backup-cli.mjs escrow-inspect --escrow .tmp/fake-escrow
```

Convenience scripts:

- `npm run escrow:create`
- `npm run escrow:validate`
- `npm run escrow:inspect`

CLI output prints non-secret status and metadata only.
