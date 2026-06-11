# Validation Command Result

Status: implemented and passed.

Command:

```powershell
node src\resource-registry-cli.mjs validate-operational-bindings --fixture fixtures/operational-bindings.v2-5-1.fixture.json --out .tmp/v2-5-1-operational-bindings --overwrite
```

Result:

- Status: passed
- Environment modes: `9`
- Provider profiles: `9`
- Resource bindings: `6`
- Failures: `0`
- Warnings: `0`

The command writes validation evidence under ignored `.tmp` only and prints counts/statuses only.

