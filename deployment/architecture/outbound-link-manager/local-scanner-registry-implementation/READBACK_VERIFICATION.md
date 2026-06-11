# Readback Verification

Readback verification reads the staging-simulated provider store after execution and emits `readback-result.json`.

## Command

```powershell
node src/outbound-link-cli.mjs staging-readback --execution .tmp/phase-2h20-staging-persistence-integration/execution --out .tmp/phase-2h20-staging-persistence-integration/readback
```

## Checks

- every staging execution record has a corresponding provider-store record
- every readback record retains required trace fields
- readback hashes match predicted execution hashes
- tenant/site scope remains stable
- no live provider read is performed

