# Validator CLI Summary

Result: passed.

CLI path:

```text
deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/src/audit-job-ledger-cli.mjs
```

Validated command:

```powershell
node src/audit-job-ledger-cli.mjs validate fixtures/valid-v2-8-combined-promotion-ledger.fixture.json
```

Result:

- Exit code: `0`
- `ok`: `true`
- Audit events: `11`
- Job runs: `9`
- Promotion gates: `11`
- Evidence bindings: `13`
- Failures: `0`

Inspect command:

```powershell
node src/audit-job-ledger-cli.mjs inspect fixtures/valid-v2-8-combined-promotion-ledger.fixture.json
```

Inspect confirmed `localOnly=true`, `writesPerformed=false`, `externalNetworkUsed=false`, `protectedConfigRead=false`, and `noWriteBoundarySatisfied=true`.

Invalid fixture CLI runs exited nonzero and returned the expected failure codes.
