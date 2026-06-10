# Test Result

Commands run:

```powershell
npm test
npm run check
```

Results:

| Check | Result |
| --- | --- |
| `npm test` | passed |
| Tests | 76 passed, 0 failed |
| `npm run check` | passed |
| API contract tests | passed |
| CLI API command tests | passed |
| Response validator tests | passed |
| Source scan for external calls/protected config reads | passed |

The test suite covers list/detail/instances/policies/audit/scan-run/dashboard service methods, domain filtering, pagination, sorting, tenant guard denial, viewer read access, blocked write actions, invalid filter and pagination errors, response validation, CLI commands, and no external-call source patterns.

