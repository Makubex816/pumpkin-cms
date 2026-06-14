# Fixture-Backed Provider Result

The API provider reads:

- `valid-import-intake-preview-ice.envelope.json`
- `valid-import-intake-preview-roller.envelope.json`

The provider validates:

- envelope and shared-model schema versions;
- `readOnly` flags;
- provider mode;
- no open security flags;
- disabled future actions;
- closed live/write/deploy/indexing/protected-config meta flags;
- package identity and rollback references.

The provider does not read protected config or call live providers.
