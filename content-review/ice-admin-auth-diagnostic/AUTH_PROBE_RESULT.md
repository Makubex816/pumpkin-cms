# Auth Probe Result

Helper:

```powershell
node tools\auth-diagnostics\probe-admin-auth.mjs --api-base http://localhost:5064
```

Result from current run:

```json
{
  "schemaVersion": "pumpkin-admin-auth-probe.v1",
  "apiBase": "http://localhost:5064",
  "tokenPresent": false,
  "envToken": "MISSING",
  "tempTokenFile": "MISSING",
  "probePerformed": false,
  "safeCategory": "token-missing",
  "tokenPrinted": false,
  "cmsWritePerformed": false
}
```

No CMS write was performed. Because no token was available, the probe did not call the auth endpoint.

