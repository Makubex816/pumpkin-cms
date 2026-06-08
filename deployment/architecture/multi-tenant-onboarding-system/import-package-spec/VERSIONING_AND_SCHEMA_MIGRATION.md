# Versioning and Schema Migration

## Version Rule

Every JSON file includes `schemaVersion`.

Initial draft version:

```text
1.0.0
```

## Migration Rules

- Backward-compatible additions may be optional.
- Breaking changes require a new schema version and migration guide.
- Validators must report unsupported versions clearly.
- Extension packs must declare compatible schema versions.
- Imported packages should record the schema version used at import time.
