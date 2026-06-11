# Pumpkin Resource Registry Local Implementation

This package implements local/offline tooling for the redacted Resource Registry and encrypted Build Handoff Vault foundation.

## Boundary

- Local-only.
- Generated output goes under ignored `.tmp`.
- No protected config reads.
- No Azure commands.
- No CMS/API calls.
- No plaintext credential files.
- No generated vault or handoff artifacts should be staged.

## Commands

```powershell
npm test
npm run check
npm run create:redacted-registry
npm run validate:registry
npm run create:fake-vault
npm run create:session-vault
npm run validate:session-vault
npm run create:handoff
npm run inspect:handoff
npm run validate:operational-bindings
```

`create:session-vault` requires `PUMPKIN_HANDOFF_VAULT_PASSPHRASE` in process environment. If it is missing, the command writes a blocker note under `.tmp` and does not create an encrypted session vault.

## Output

The committed package contains only source, tests, fixtures, and docs. Generated registry, vault, and handoff packages are written under ignored `.tmp/` output.

The session vault encrypts only approved durable env material. `PUMPKIN_ADMIN_JWT` is recorded as present/excluded and is not durable escrow.

## V2.5.1 Operational Bindings

`validate:operational-bindings` validates the V2.5.1 non-secret Resource Registry / Provider Profile control-layer fixture. It checks provider modes, required profile fields, resource binding targets, scoped `live-write-approved` state, blocked `production-runtime`, stale evidence references, placeholder values, and secret-like values. The command writes evidence under ignored `.tmp/` only.

## Docs

- `USAGE.md`
- `REDACTED_RESOURCE_REGISTRY.md`
- `CREDENTIAL_REFERENCES.md`
- `ENCRYPTED_HANDOFF_VAULT.md`
- `SESSION_VAULT_BOOTSTRAP.md`
- `HANDOFF_PACKAGE_FORMAT.md`
- `VALIDATOR.md`
- `SECURITY_BOUNDARIES.md`
- `KNOWN_LIMITATIONS.md`
- `NEXT_PHASE_2F12N_REAL_RESOURCE_REGISTRY_LIVE_INVENTORY_PROMPT.md`
