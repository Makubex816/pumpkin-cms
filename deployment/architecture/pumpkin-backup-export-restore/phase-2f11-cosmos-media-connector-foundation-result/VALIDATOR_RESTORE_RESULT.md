# Validator And Restore Result

Validator updates:

- Added `production-restore-proof` mode.
- Baseline mode still allows partial database/media components.
- Proof mode requires complete fake Cosmos portable JSON export.
- Proof mode requires complete fake media full-copy artifacts.
- Proof mode requires the tenant website bundle index.
- Negative tests cover missing Cosmos export, missing media blob copy, and secret-like connector output.

Restore-plan updates:

- Reads connector component status.
- Reports Cosmos record-set and record counts.
- Reports fake copied media blob count.
- Marks Cosmos/media/tenant bundle steps complete in fake complete mode.
- Keeps restore execution disabled.

No real restore was performed.
