# Rollback Package

The migration dry-run writes a local rollback package:

- `ROLLBACK_PACKAGE.json`
- `ROLLBACK_PACKAGE.md`

The package summarizes candidate counts, future rollback intent, entity scopes, and the fact that rollback execution is not implemented in this local package.

The rollback package is evidence, not a live recovery tool. It does not authorize future live rollback and cannot be executed against Azure, CMS APIs, Cosmos, or any production provider.
