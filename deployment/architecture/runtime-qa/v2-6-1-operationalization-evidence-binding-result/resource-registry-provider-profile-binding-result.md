# Resource Registry Provider Profile Binding Result

Status: passed.

Command:

```powershell
node src\resource-registry-cli.mjs validate-operational-bindings --fixture fixtures/operational-bindings.v2-5-1.fixture.json --out .tmp/v2-6-1-operational-bindings --overwrite
```

Result:

- Operational bindings: `passed`
- Environment modes: `9`
- Provider profiles: `9`
- Resource bindings: `6`
- Failures: `0`
- Warnings: `0`

The Runtime QA registry also validated the V2.5.1 provider mode matrix during the evidence run.
