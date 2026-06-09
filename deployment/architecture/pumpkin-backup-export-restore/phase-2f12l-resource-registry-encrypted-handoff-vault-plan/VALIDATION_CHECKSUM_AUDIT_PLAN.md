# Validation, Checksum, and Audit Plan

## Registry Validation

Validation should check:

- Manifest JSON parses.
- Every resource has a stable ID.
- Every credential reference points to at least one resource or purpose.
- No credential values are present.
- Resource IDs are unique.
- Tenant/site references are valid.
- Runtime profile references exist.
- Status values are allowed.
- Retired resources have cleanup notes.

## Handoff Package Validation

Validation should check:

- Package manifest exists.
- Redacted registry exists.
- Credential reference list contains no values.
- Vault is either absent with `VAULT_NOT_INCLUDED.md` or encrypted with a manifest.
- Checksums match.
- Rotation/cleanup instructions exist.

## Audit Events

Audit entries should record:

- Registry generated
- Registry validated
- Vault approval requested
- Vault generated
- Vault downloaded
- Vault verified
- Credential rotated
- Credential removed
- Resource retired

## Checksums

Use SHA-256 checksums for registry and handoff package files. Future encrypted vault checksum coverage should include encrypted payload bytes, manifest, approval record, and recipient metadata.

