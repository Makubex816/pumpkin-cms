# Usage

Run commands from:

```powershell
deployment/architecture/outbound-link-manager/local-scanner-registry-implementation
```

## Help

```powershell
node src/outbound-link-cli.mjs help
node src/outbound-link-cli.mjs version
```

## Scan A Fixture

```powershell
node src/outbound-link-cli.mjs scan --fixture fixtures/single-link.fixture.json --out .tmp/single-link-scan --overwrite
```

## Validate Scan Output

```powershell
node src/outbound-link-cli.mjs validate --scan .tmp/single-link-scan
```

## Inspect Scan Output

```powershell
node src/outbound-link-cli.mjs inspect --scan .tmp/single-link-scan
```

## Initialize A Local Store

```powershell
node src/outbound-link-cli.mjs init-store --tenant fixture-tenant --site fixture-site --out .tmp/local-store --overwrite
```

## Merge A Scan Into A Local Store

```powershell
node src/outbound-link-cli.mjs scan --fixture fixtures/tenant-bundle.fixture.json --out .tmp/tenant-bundle-scan --overwrite
node src/outbound-link-cli.mjs merge-scan --store .tmp/local-store --scan .tmp/tenant-bundle-scan --out .tmp/local-store-merged --overwrite
```

## Change Local Status

```powershell
node src/outbound-link-cli.mjs set-link-status --store .tmp/local-store-merged --link-domain partner.example --status disabled --reason "local fixture test" --out .tmp/local-store-disabled --overwrite
node src/outbound-link-cli.mjs set-instance-status --store .tmp/local-store-merged --instance-id fixture-instance-id --status plain_text --reason "local fixture test" --out .tmp/local-store-instance-disabled --overwrite
```

## Apply Local Policy

```powershell
node src/outbound-link-cli.mjs set-policy --store .tmp/local-store-merged --policy fixtures/policy-blocked-domain.fixture.json --out .tmp/local-store-policy --overwrite
```

## Export Store

```powershell
node src/outbound-link-cli.mjs export-store --store .tmp/local-store-policy --out .tmp/local-store-export --overwrite
```

## Validate And Inspect Store

```powershell
node src/outbound-link-cli.mjs validate-store --store .tmp/local-store-policy
node src/outbound-link-cli.mjs inspect-store --store .tmp/local-store-policy
```

## Render Fixture Decisions

```powershell
node src/outbound-link-cli.mjs render-fixture --fixture fixtures/render-active-links.fixture.json --store .tmp/local-store-merged --out .tmp/render-active --overwrite
node src/outbound-link-cli.mjs validate-render --rendered .tmp/render-active
node src/outbound-link-cli.mjs inspect-render --rendered .tmp/render-active
```

Render commands write `render-decisions.json`, `render-report.json`, `RENDER_REPORT.md`, `static-export.html`, and validation files under `.tmp`.

## Export Backup Center Files

```powershell
node src/outbound-link-cli.mjs export-backup --store .tmp/local-store-merged --rendered .tmp/render-active --out .tmp/backup-center-export --overwrite
node src/outbound-link-cli.mjs validate-backup-export --export .tmp/backup-center-export
```

## Export Tenant Bundle Files

```powershell
node src/outbound-link-cli.mjs export-tenant-bundle --store .tmp/local-store-merged --rendered .tmp/render-active --out .tmp/tenant-bundle-export --overwrite
node src/outbound-link-cli.mjs validate-tenant-bundle --bundle .tmp/tenant-bundle-export
```

## Create Onboarding Import Files

```powershell
node src/outbound-link-cli.mjs create-onboarding-import --store .tmp/local-store-merged --out .tmp/onboarding-import --overwrite
node src/outbound-link-cli.mjs validate-onboarding-import --import .tmp/onboarding-import
```

## Simulate Restore Validation

```powershell
node src/outbound-link-cli.mjs simulate-restore-validation --export .tmp/backup-center-export --out .tmp/restore-validation --overwrite
```

## Simulate Local Write-Action Guards

```powershell
node src/outbound-link-cli.mjs simulate-action --store .tmp/local-store-policy --request fixtures/action-approve-review.fixture.json --out .tmp/action-approve-review --overwrite
node src/outbound-link-cli.mjs simulate-action --store .tmp/local-store-policy --request fixtures/action-block-review.fixture.json --out .tmp/action-block-review --overwrite
node src/outbound-link-cli.mjs simulate-action --store .tmp/local-store-policy --request fixtures/action-disable-link.fixture.json --out .tmp/action-disable-link --overwrite
node src/outbound-link-cli.mjs simulate-action --store .tmp/local-store-policy --request fixtures/action-bulk-domain-disable.fixture.json --out .tmp/action-bulk-domain-disable --overwrite
node src/outbound-link-cli.mjs validate-action-result --result .tmp/action-disable-link
```

Each simulation reads an existing `.tmp` local store, evaluates tenant/role/reason/profile guards, writes sandbox mutations only under the requested `.tmp` output, and emits `ACTION_RESULT.json`, `PUBLISHING_IMPACT.json`, `ACTION_AUDIT_LOG.json` for approved simulations, `ROLLBACK_PLAN.json`, and validation files.

## API Write Preflight Bridge

```powershell
node src/outbound-link-cli.mjs api-write-preflight --store .tmp/local-store-policy --request fixtures/api-write-preflight-approve-review.fixture.json --out .tmp/api-write-preflight-approve-review --overwrite
node src/outbound-link-cli.mjs api-write-preflight --store .tmp/local-store-policy --request fixtures/api-write-preflight-bulk-domain-disable.fixture.json --out .tmp/api-write-preflight-bulk-domain-disable --overwrite
node src/outbound-link-cli.mjs api-write-preflight --store .tmp/local-store-policy --request fixtures/api-write-preflight-live-readonly-blocked.fixture.json --out .tmp/api-write-preflight-live-readonly-blocked --overwrite
node src/outbound-link-cli.mjs validate-api-write-preflight --result .tmp/api-write-preflight-approve-review
node src/outbound-link-cli.mjs validate-api-write-preflight --result .tmp/api-write-preflight-live-readonly-blocked
```

The bridge accepts API-shaped requests, maps approved local/fake actions to the Phase 2H-12 simulator, writes `API_WRITE_RESPONSE.json`, writes `TRACE_LOG.json`, records before/after state hashes, captures entity/audit/rollback IDs, and blocks live-readonly or live-write-approved provider modes in this local package.

## Migration Dry-Run

```powershell
node src/outbound-link-cli.mjs migration-dry-run --store .tmp/local-store-policy --profile fixtures/migration-production-provider-profile.fixture.json --out .tmp/phase-2h17-migration-dry-run --overwrite
node src/outbound-link-cli.mjs validate-migration-dry-run --migration .tmp/phase-2h17-migration-dry-run
node src/outbound-link-cli.mjs inspect-migration-dry-run --migration .tmp/phase-2h17-migration-dry-run
```

The migration dry-run transforms the local store into production-shaped candidate records under `.tmp`, writes `production-records/*.json`, `migration-manifest.json`, `checksums.sha256`, `ROLLBACK_PACKAGE.md`, `RESOURCE_REGISTRY_UPDATE_CANDIDATE.json`, `BACKUP_BEFORE_MIGRATION_REQUIREMENTS.md`, and validation reports. It does not write any live provider.

## Scripts

```powershell
npm test
npm run check
npm run scan:single
npm run scan:tenant-bundle
npm run validate:tenant-bundle
npm run inspect:tenant-bundle
npm run store:init
npm run store:merge
npm run store:validate
npm run store:inspect
npm run render:active
npm run render:validate
npm run integration:backup
npm run integration:tenant-bundle
```

The scanner, store writer, exporter, render writer, and integration writers refuse output outside `.tmp`.
