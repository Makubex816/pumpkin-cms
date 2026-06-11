# Usage

Run from this package directory:

```powershell
npm test
npm run check
node src/resource-registry-cli.mjs help
node src/resource-registry-cli.mjs version
```

Create and validate a redacted registry:

```powershell
node src/resource-registry-cli.mjs create-redacted-registry --fixtures fixtures/resource-registry.fixture.json --out .tmp/redacted-registry --overwrite
node src/resource-registry-cli.mjs validate-registry --registry .tmp/redacted-registry
```

Create test and session vaults:

```powershell
node src/resource-registry-cli.mjs create-fake-vault --request fixtures/fake-vault-request.fixture.json --out .tmp/fake-vault --overwrite
node src/resource-registry-cli.mjs create-session-vault --out .tmp/session-handoff-vault --overwrite
node src/resource-registry-cli.mjs validate-vault --vault .tmp/session-handoff-vault
```

Create and inspect a handoff package:

```powershell
node src/resource-registry-cli.mjs create-handoff --registry fixtures/resource-registry.fixture.json --credential-references fixtures/credential-references.fixture.json --out .tmp/fake-handoff --overwrite
node src/resource-registry-cli.mjs create-handoff --registry fixtures/resource-registry.fixture.json --credential-references fixtures/credential-references.fixture.json --vault .tmp/session-handoff-vault --out .tmp/session-handoff --overwrite
node src/resource-registry-cli.mjs inspect-handoff --handoff .tmp/session-handoff
```

Validate the V2.5.1 operational Resource Registry / Provider Profile binding fixture:

```powershell
node src/resource-registry-cli.mjs validate-operational-bindings --fixture fixtures/operational-bindings.v2-5-1.fixture.json --out .tmp/v2-5-1-operational-bindings --overwrite
```

CLI output prints statuses, counts, and paths only. It does not print secrets or decrypted payloads.
