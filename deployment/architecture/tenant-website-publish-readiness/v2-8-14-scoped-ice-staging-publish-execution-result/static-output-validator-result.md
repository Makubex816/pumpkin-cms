# Static Output Validator Result

Command:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612222605/repo/apps/ice-rink-web/out
```

Result: passed.

- `ok`: `true`
- `fileCount`: `41`
- `localStaticIntegrityOk`: `true`
- `externalApprovalGatesOk`: `true`
- `gateClassification.status`: `passed`
- `staticFormGate.status`: `configured_owner_approved_backend_verified`
- `externalApprovalGateCount`: `0`
- `errors`: `0`
- `warnings`: `0`

