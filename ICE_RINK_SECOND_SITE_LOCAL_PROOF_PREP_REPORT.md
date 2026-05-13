# Ice Rink Second Site Local Proof Prep Report

## Summary

Prepared the local seed tool so a second local tenant proof can be run for `second-product-rentals` without changing app behavior, API code, shared packages, or local secret files.

The frontend config already supports:

- host: `second.localhost:3002`
- tenant env var: `SECOND_PRODUCT_TENANT_ID`
- API key env var: `SECOND_PRODUCT_API_KEY`
- canonical env var: `SECOND_PRODUCT_CANONICAL_URL`
- brand: `Second Product Rentals`

## Files Changed

- `tools/ice-rink-local-seed/README.md`
- `tools/ice-rink-local-seed/scripts/validate-seed.mjs`
- `tools/ice-rink-local-seed/scripts/seed-local-cosmos.mjs`
- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/README.md`
- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/tenant.template.json`

## Files Created

- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/theme.json`
- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/pages/home.json`
- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/pages/second-product-rentals.json`
- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/pages/contact.json`
- `ICE_RINK_SECOND_SITE_LOCAL_PROOF_PREP_REPORT.md`

Removed obsolete placeholder-only files:

- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/theme.placeholder.json`
- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/pages/README.md`

## How Second-site Seed Support Works

The seed tool reads `SITE_KEY` and defaults to `ice-rink-rentals` when it is missing.

Site-specific API hash env vars are now supported:

- `ice-rink-rentals` uses `ICE_RINK_RENTALS_API_HASH`
- `second-product-rentals` uses `SECOND_PRODUCT_API_HASH`

The second-site seed set now includes:

- tenant template with `apiKeyHash: "__SECOND_PRODUCT_API_HASH__"`
- active second-site theme
- published pages:
  - `home`
  - `second-product-rentals`
  - `contact`

All second-site content is generic local proof content and is marked `noindex, nofollow`.

## Required Local Env Vars

For seeding the second tenant:

```powershell
$env:SITE_KEY = "second-product-rentals"
$env:COSMOS_CONNECTION_STRING = "<local-cosmos-emulator-connection-string>"
$env:COSMOS_DATABASE_NAME = "PumpkinCMS"
$env:SECOND_PRODUCT_API_HASH = "<generated-bcrypt-api-key-hash>"
```

For running the frontend against the second tenant, manually add local-only values to `apps/ice-rink-web/.env.local`:

```text
SECOND_PRODUCT_TENANT_ID=second-product-rentals
SECOND_PRODUCT_API_KEY=<generated-plain-api-key>
SECOND_PRODUCT_CANONICAL_URL=https://second-domain-placeholder.com
```

Do not commit those values.

## Hostname Resolution

`apps/ice-rink-web/src/config/sites.ts` already maps `second.localhost:3002` to `second-product-rentals`.

After seeding and setting the frontend env vars, test:

```text
http://second.localhost:3002/
http://second.localhost:3002/second-product-rentals
http://second.localhost:3002/contact
http://second.localhost:3002/sitemap.xml
```

If `second.localhost` does not resolve on Windows, add a local hosts entry or use a browser/runtime setup that maps `*.localhost` to `127.0.0.1`.

## Validation Results

Ice Rink validation passed:

```text
Seed validation passed for SITE_KEY=ice-rink-rentals.
Validated tenant template, theme, and 4 page documents.
```

Second-site validation passed:

```text
Seed validation passed for SITE_KEY=second-product-rentals.
Validated tenant template, theme, and 3 page documents.
```

## Seed Run Status

Seed was not run in this pass.

The current shell did not have the required local seed env vars present:

- `COSMOS_CONNECTION_STRING`: not present
- `ICE_RINK_RENTALS_API_HASH`: not present
- `SECOND_PRODUCT_API_HASH`: not present
- `COSMOS_DATABASE_NAME`: not present

No Cosmos data was changed.

## Next Manual Steps For Steven

1. Generate a second local API key and hash:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms"
dotnet run --project apps/pumpkin-api.Tests
```

2. Set local seed env vars in PowerShell, including `SECOND_PRODUCT_API_HASH`.

3. Run the second-site seed:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\tools\ice-rink-local-seed"
$env:SITE_KEY = "second-product-rentals"
npm run validate
npm run seed
```

4. Add the matching plain API key to `apps/ice-rink-web/.env.local` manually as `SECOND_PRODUCT_API_KEY`.

5. Restart `apps/ice-rink-web` and open `http://second.localhost:3002`.

6. Verify second-site pages, sitemap, and a contact form submission in Cosmos `PumpkinCMS -> FormEntry -> Items`.

## Warnings

- Do not commit generated API keys, API hashes, connection strings, passwords, or local env files.
- The second-site content is proof-only and intentionally generic.
- Replace duplicate-risk placeholder copy, SEO, structured data, contact details, and theme details before production.
- Keep the existing `ice-rink-rentals` seed path as the default until the second-site proof is fully verified.
