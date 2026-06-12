# Staging Package Validator Result

Command:

```powershell
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612233427/repo/apps/ice-rink-web/out
```

Result: passed.

Key fields:

- File count: `41`.
- Local static integrity: `true`.
- External approval gates: `true`.
- Static form gate: `configured_owner_approved_backend_verified`.
- Structural errors: `0`.
- Warnings: `0`.

