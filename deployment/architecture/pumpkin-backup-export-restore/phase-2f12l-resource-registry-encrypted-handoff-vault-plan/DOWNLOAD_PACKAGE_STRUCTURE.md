# Download Package Structure

This phase defines the future structure only. No package or zip was created.

## Future Folder or Zip Shape

```text
resource-handoff/
  REDACTED_RESOURCE_REGISTRY.json
  RESOURCE_REGISTRY_SUMMARY.md
  RESOURCE_TO_TENANT_MAP.md
  RUNTIME_PROFILE_MAP.md
  REQUIRED_CREDENTIAL_REFERENCES.json
  VAULT_NOT_INCLUDED.md
  CHECKSUMS.sha256
  VALIDATION_RESULT.md
  ROTATION_AND_CLEANUP.md
```

## Future Encrypted Vault Variant

```text
resource-handoff/
  REDACTED_RESOURCE_REGISTRY.json
  RESOURCE_REGISTRY_SUMMARY.md
  RESOURCE_TO_TENANT_MAP.md
  RUNTIME_PROFILE_MAP.md
  REQUIRED_CREDENTIAL_REFERENCES.json
  encrypted-vault/
    vault-manifest.json
    encrypted-payload.bin
    approval-record.json
    recipient-metadata.json
    CHECKSUMS.sha256
  CHECKSUMS.sha256
  VALIDATION_RESULT.md
  ROTATION_AND_CLEANUP.md
```

## Rules

- The redacted registry can be committed.
- The encrypted vault cannot be committed.
- If no encrypted vault is included, `VAULT_NOT_INCLUDED.md` must explain why.
- Checksums must cover the redacted package and, if present, encrypted vault files.
- Validation must fail if plaintext credential values are present.

