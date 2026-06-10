# Test Result

Command:

```powershell
npm run check
```

Result:

- status: passed
- total tests: 29
- passed: 29
- failed: 0

New persistence tests cover:

- empty store initialization;
- first scan merge;
- idempotent duplicate merge;
- same URL with multiple instances;
- link status lifecycle and audit log;
- instance status lifecycle and audit log;
- blocked-domain policy;
- export compatibility;
- orphan instance validation failure;
- bad status validation failure;
- tenant mismatch validation failure;
- secret-like value validation failure;
- local store CLI commands;
- no external call or protected config read patterns.
