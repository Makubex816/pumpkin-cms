# Handoff Package Format

The handoff package is a folder under `.tmp/`.

Without a vault:

```text
handoff/
  manifest.json
  REDACTED_RESOURCE_REGISTRY.json
  RESOURCE_REGISTRY_SUMMARY.md
  RESOURCE_TO_TENANT_MAP.md
  RUNTIME_PROFILE_MAP.md
  REQUIRED_SECRET_REFERENCES.json
  VAULT_NOT_INCLUDED.md
  ROTATION_AND_CLEANUP.md
  CHECKSUMS.sha256
  validation-result.json
  VALIDATION_RESULT.md
```

With a vault:

```text
handoff/
  manifest.json
  REDACTED_RESOURCE_REGISTRY.json
  RESOURCE_REGISTRY_SUMMARY.md
  RESOURCE_TO_TENANT_MAP.md
  RUNTIME_PROFILE_MAP.md
  REQUIRED_SECRET_REFERENCES.json
  encrypted-vault/
    vault-manifest.json
    encrypted-payload.bin
    approval-record.json
    recipient-metadata.json
    CHECKSUMS.sha256
  ROTATION_AND_CLEANUP.md
  CHECKSUMS.sha256
  validation-result.json
  VALIDATION_RESULT.md
```

The package is intentionally folder-based. No zip is required for this phase.
