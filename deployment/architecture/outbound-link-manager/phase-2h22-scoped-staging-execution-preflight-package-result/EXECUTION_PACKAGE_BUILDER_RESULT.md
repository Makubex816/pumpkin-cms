# Execution Package Builder Result

Status: passed.

Command:

```powershell
node src/outbound-link-cli.mjs build-staging-execution-package --source fixtures/execution-package-source.fixture.json --out .tmp/phase-2h22-staging-execution-package --overwrite
```

Result:

- package ID: `phase-2h22-scoped-staging-execution-preflight-package`
- provider profile ID: `staging-execution-profile`
- provider mode: `staging-simulated`
- expected records: 48
- future approval required: `true`
- real staging provider write performed: `false`

