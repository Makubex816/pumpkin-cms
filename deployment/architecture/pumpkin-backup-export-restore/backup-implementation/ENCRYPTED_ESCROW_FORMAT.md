# Encrypted Escrow Format

Generated fake escrow output under `.tmp` includes:

```text
<escrow-output>/
  escrow-manifest.json
  encrypted-payload.bin
  recipient-metadata.json
  escrow-approval-record.json
  escrow-validation-result.json
  ESCROW_VALIDATION_RESULT.md
  ESCROW_FAKE_ONLY_NOTICE.md
```

## Encryption

- Payload encryption: `AES-256-GCM`
- Key wrap: `RSA-OAEP-256`
- Recipient key source: generated at runtime
- Private key persistence: `not-written`
- Payload: fake fixture catalog values only

The encrypted payload is binary and must not be plaintext JSON.

## Manifest

`escrow-manifest.json` records fake-only mode, policy id, item count, categories, recipient metadata, encryption metadata, encrypted payload hash, approval record path, fake-only notice path, and explicit boundaries.

## Standard Backup Separation

Standard backup bundles still include only `escrow/ESCROW_NOT_INCLUDED.md`. The standard backup validator continues to reject escrow payload files in standard mode.
