# Fake Connector Regression Result

Regression checks were run from:

```text
deployment/architecture/pumpkin-backup-export-restore/backup-implementation/
```

## Results

| Command | Result |
| --- | --- |
| `npm test` | PASSED, 48 tests |
| `npm run check` | PASSED on rerun, 48 tests |
| `npm run create:ice-fake-complete` | PASSED |
| `npm run validate:ice-fake-complete` | PASSED |
| `npm run restore:ice-fake-complete` | PASSED |

## Note

One earlier `npm run check` attempt hit a transient existing fake escrow validation failure while a separate direct `npm test` had already passed. A clean rerun of `npm run check` passed all 48 tests. The fake Cosmos/media connector commands passed.

## Generated Output

Fake connector output was generated only under ignored `.tmp` paths in the backup implementation package. Those generated artifacts were not staged.
