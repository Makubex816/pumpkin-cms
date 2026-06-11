# Runtime QA Operating Guide

Run the Outbound Link Manager Admin runtime QA harness:

```powershell
cd apps/admin
npm run test:phase-2h21
```

The command writes evidence under:

```text
deployment/architecture/outbound-link-manager/local-scanner-registry-implementation/.tmp/phase-2h21-runtime-qa-provider-readiness/admin-runtime-qa/
```

Reusable module:

```text
apps/admin/scripts/runtime-qa-harness.mjs
```

Future modules should provide marker groups, source roots, write-call/protected-config scans, provider-mode checks, and an ignored `.tmp` evidence path. Local/offline and fake-provider checks must work without protected config, live provider access, or live writes.

