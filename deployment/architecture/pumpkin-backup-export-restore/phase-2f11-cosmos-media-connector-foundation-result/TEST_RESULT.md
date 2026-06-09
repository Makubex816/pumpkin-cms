# Test Result

Validation commands run from:

```text
deployment/architecture/pumpkin-backup-export-restore/backup-implementation/
```

Results:

- `npm test`: passed, 48 tests
- `npm run check`: passed
- `npm run create:ice-fake-complete`: passed
- `npm run validate:ice-fake-complete`: passed
- `npm run restore:ice-fake-complete`: passed

Covered cases include:

- Existing tenant/platform bundle generation.
- Existing validator failure cases.
- Existing restore-plan dry-run cases.
- Fake encrypted escrow tests.
- Fake Cosmos export generation.
- Fake media copy generation.
- Proof-mode validator pass.
- Proof-mode restore-plan pass.
- Missing Cosmos export failure.
- Missing media blob copy failure.
- Secret-like connector output failure.
