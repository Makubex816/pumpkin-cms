# Token Shape Diagnostic

Helper:

```powershell
node tools\auth-diagnostics\inspect-admin-jwt-shape.mjs
```

Result from current run:

```json
{
  "schemaVersion": "pumpkin-admin-jwt-shape-diagnostic.v1",
  "tokenPresent": false,
  "source": "none",
  "envToken": "MISSING",
  "tempTokenFile": "MISSING",
  "tokenPrinted": false
}
```

The helper is ready to decode safe JWT header/payload fields when a token is available. It does not print the raw token, signature, or secrets.

