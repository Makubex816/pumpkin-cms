# Test Fixture Plan

## Required Fixtures

| Fixture | Purpose |
| --- | --- |
| tenant standard backup fixture | proves happy path bundle |
| full platform backup fixture | proves platform scope shape without real export |
| invalid manifest fixture | schema failure |
| checksum mismatch fixture | checksum failure |
| secret leakage fixture | value-level scan failure |
| protected path fixture | path guard failure |
| escrow not included fixture | standard backup escrow marker |
| encrypted escrow fake fixture | fake encrypted payload behavior for Phase 2F-5 |
| restore validation fixture | dry-run restore plan |
| expiration fixture | retention status transitions |

## Fixture Location

Future Phase 2F-3:

```text
deployment/architecture/pumpkin-backup-export-restore/backup-implementation/fixtures/
```

## Fake Data Rule

Fixtures must use fake tenants, fake keys, placeholder fingerprints, placeholder hashes, and synthetic content only. No real tenant secrets, protected config, raw `content-review`, or generated production artifacts.

## Test Commands

Future package should support:

```text
npm test
npm run check
npm run create:example
npm run validate:example
```
