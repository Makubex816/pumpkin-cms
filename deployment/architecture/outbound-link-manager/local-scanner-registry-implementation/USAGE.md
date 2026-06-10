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

## Scripts

```powershell
npm test
npm run check
npm run scan:single
npm run scan:tenant-bundle
npm run validate:tenant-bundle
npm run inspect:tenant-bundle
```

The scanner refuses output outside `.tmp`.
