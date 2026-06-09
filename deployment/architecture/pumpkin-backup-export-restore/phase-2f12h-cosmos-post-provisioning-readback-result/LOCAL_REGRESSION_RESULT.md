# Local Regression Result

## Commands

| Command | Result |
| --- | --- |
| `npm test` | pass, 56/56 |
| `npm run check` | pass on final sequential run |
| `node src/backup-cli.mjs resolve-provider --fixture fixtures/provider-source.ice.future-target-cosmos.json` | pass |

## Resolver CLI Output Summary

```text
providerType: cosmos
providerStatus: future-target
sourceResolutionStatus: provisioned
selectedTargetProvider: cosmos
exportReadiness: metadata-endpoint-runtime-wiring-required
liveDatabaseExportAllowed: false
nextAction: metadata-endpoint-runtime-wiring-approval-required
```

## Note

An initial parallel run of `npm test` and `npm run check` collided in shared `.tmp` test folders because `npm run check` also runs the test suite. After rerunning sequentially, `npm test` passed. A later `npm run check` attempt had one transient fake-escrow plaintext-detector failure; the immediate final rerun passed without code changes to escrow.

