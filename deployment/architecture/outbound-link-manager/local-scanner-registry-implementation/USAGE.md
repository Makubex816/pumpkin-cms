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
```

The scanner, store writer, exporter, and render writer refuse output outside `.tmp`.
