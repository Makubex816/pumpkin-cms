# Test Result

## Commands Run

```powershell
npm test
npm run check
npm run create:tenant
npm run create:platform
npm run validate:tenant
npm run validate:platform
node src/backup-cli.mjs inspect --bundle .tmp/tenant-standard-backup
```

## Results

| Check | Result |
| --- | --- |
| `npm test` | passed, 9 tests |
| `npm run check` | passed, syntax checks plus 9 tests |
| Tenant standard backup generation | passed |
| Platform standard backup generation | passed |
| Tenant validation | passed |
| Platform validation | passed |
| Tenant inspect | passed |

## Test Coverage

- tenant standard backup generation;
- platform standard backup generation;
- manifest validity;
- checksum validity;
- validator happy path;
- missing file failure;
- checksum mismatch failure;
- escrow payload rejection;
- secret-like value rejection;
- output path safety;
- no external/protected-config call pattern in core source;
- `.tmp` ignored.
