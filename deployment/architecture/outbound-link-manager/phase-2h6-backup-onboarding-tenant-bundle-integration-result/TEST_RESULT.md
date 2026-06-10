# Test Result

Command:

```powershell
npm run check
```

Result:

- status: passed
- total tests: 57
- passed: 57
- failed: 0

New integration tests cover:

- Backup Center export required files;
- Backup Center export validation;
- tenant bundle export required files;
- tenant bundle validation;
- onboarding import required files;
- valid onboarding import pass;
- unreviewed-domain onboarding failure;
- blocked-domain onboarding failure;
- restore simulation link count;
- restore simulation instance count;
- restore simulation disabled status preservation;
- restore simulation policy state preservation;
- CLI integration commands;
- no external calls or protected config reads.
