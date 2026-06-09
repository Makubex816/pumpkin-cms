# Escrow Fake Prototype

Phase 2F-6 adds a local-only encrypted escrow prototype with fake fixture values only.

## Command

```powershell
node src/backup-cli.mjs escrow-create-fake --request fixtures/fake-escrow-request.json --out .tmp/fake-escrow --overwrite
node src/backup-cli.mjs escrow-validate --escrow .tmp/fake-escrow
node src/backup-cli.mjs escrow-inspect --escrow .tmp/fake-escrow
```

## Behavior

The fake escrow flow:

- reads fake fixture request, policy, catalog, and recipient metadata;
- validates fake-only policy gates;
- generates an ephemeral RSA key pair at runtime;
- encrypts fake catalog values with AES-256-GCM;
- wraps the content key with RSA-OAEP;
- verifies a local round trip in memory;
- writes encrypted fake escrow output under ignored `.tmp`;
- writes validation JSON and Markdown reports;
- writes a fake-only notice.

Private keys are not written. Real secrets are not read, exported, printed, or encrypted.

## Boundary

This is not production escrow. Real escrow requires owner approval, key-management decisions, access-control design, audit logging, and a separate real-backup preflight.
