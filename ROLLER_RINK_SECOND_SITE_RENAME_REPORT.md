# Roller Rink Second Site Rename Report

## Summary

Replaced the generic `second-product-rentals` placeholder with the confirmed second site: RollerRinkRentals.com.

The multi-site frontend config, app env example, seed scripts, seed folder, seed JSON, and seed README now use `roller-rink-rentals` and `ROLLER_RINK_RENTALS_*` values. The existing `ice-rink-rentals` seed flow remains the default.

## Files Changed

- `apps/ice-rink-web/src/config/sites.ts`
- `apps/ice-rink-web/.env.example`
- `apps/ice-rink-web/README.md`
- `tools/ice-rink-local-seed/README.md`
- `tools/ice-rink-local-seed/scripts/validate-seed.mjs`
- `tools/ice-rink-local-seed/scripts/seed-local-cosmos.mjs`

## Seed Structure Changes

Removed the generic placeholder path:

```text
tools/ice-rink-local-seed/seed-sites/second-product-rentals
```

Added the Roller Rink path:

```text
tools/ice-rink-local-seed/seed-sites/roller-rink-rentals/
  README.md
  tenant.template.json
  theme.json
  pages/
    home.json
    roller-rink-rentals.json
    contact.json
```

## Old Placeholder Values Replaced

- `second-product-rentals`
- `second-domain-placeholder.com`
- `second.localhost:3002`
- `Second Product Rentals`
- `SECOND_PRODUCT_TENANT_ID`
- `SECOND_PRODUCT_API_KEY`
- `SECOND_PRODUCT_CANONICAL_URL`
- `SECOND_PRODUCT_API_HASH`

## New Roller Rink Values

- site key: `roller-rink-rentals`
- tenant ID: `roller-rink-rentals`
- domain: `rollerrinkrentals.com`
- local host: `roller.localhost:3002`
- brand: `Roller Rink Rentals`
- primary service: `Portable Roller Rink Rentals`
- service keyword: `roller rink rentals`
- product: `portable roller rink`
- product plural: `portable roller rinks`
- seed hash placeholder: `__ROLLER_RINK_RENTALS_API_HASH__`

## Required Env Vars

Frontend local-only values for `apps/ice-rink-web/.env.local`:

```text
ROLLER_RINK_RENTALS_TENANT_ID=roller-rink-rentals
ROLLER_RINK_RENTALS_API_KEY=<generated-plain-api-key>
ROLLER_RINK_RENTALS_CANONICAL_URL=https://rollerrinkrentals.com
```

Seed-time PowerShell values:

```powershell
$env:SITE_KEY = "roller-rink-rentals"
$env:COSMOS_CONNECTION_STRING = "<local-cosmos-emulator-connection-string>"
$env:COSMOS_DATABASE_NAME = "PumpkinCMS"
$env:ROLLER_RINK_RENTALS_API_HASH = "<generated-bcrypt-api-key-hash>"
```

## Validation Results

Default Ice Rink validation passed:

```text
Seed validation passed for SITE_KEY=ice-rink-rentals.
Validated tenant template, theme, and 4 page documents.
```

Roller Rink validation passed:

```text
Seed validation passed for SITE_KEY=roller-rink-rentals.
Validated tenant template, theme, and 3 page documents.
```

PowerShell command used for Roller Rink validation:

```powershell
$env:SITE_KEY = "roller-rink-rentals"
npm run validate
Remove-Item Env:SITE_KEY
```

## Seed Run Status

Seed was not run.

The required local env vars were not present in this shell:

- `COSMOS_CONNECTION_STRING`: not present
- `ROLLER_RINK_RENTALS_API_HASH`: not present
- `COSMOS_DATABASE_NAME`: not present

No Cosmos data was changed.

## Routes To Test

After generating the Roller Rink API key/hash, seeding the tenant, and manually adding the frontend env vars, test:

```text
http://roller.localhost:3002/
http://roller.localhost:3002/roller-rink-rentals
http://roller.localhost:3002/contact
http://roller.localhost:3002/sitemap.xml
```

## Sitemap And Canonical Expectations

The Roller Rink seed pages use these canonical URLs:

- `https://rollerrinkrentals.com/`
- `https://rollerrinkrentals.com/roller-rink-rentals`
- `https://rollerrinkrentals.com/contact`

The Roller Rink sitemap should include the three published CMS-backed routes after the tenant is seeded.

## Duplicate-content Warning

Roller Rink Rentals and Ice Skating Rink Rentals should not ship with lightly swapped duplicate copy. The current Roller Rink seed content avoids ice-rink-specific wording and is suitable for local proof testing, but final production content, images, structured data, and conversion copy should be differentiated before launch.

## Secrets Warning

No API keys, hashes, passwords, connection strings, or local env values were committed. Do not commit `.env.local`, generated plain API keys, generated BCrypt hashes, Cosmos connection strings, or appsettings development files.

## Next Manual Steps For Steven

1. Generate a new API key/hash with `dotnet run --project apps/pumpkin-api.Tests`.
2. Put the generated hash into `ROLLER_RINK_RENTALS_API_HASH` in the current PowerShell session only.
3. Put the matching plain key into `apps/ice-rink-web/.env.local` as `ROLLER_RINK_RENTALS_API_KEY`.
4. Run `SITE_KEY=roller-rink-rentals` validation and seed from `tools/ice-rink-local-seed`.
5. Restart the frontend and test `http://roller.localhost:3002`.
6. Submit the Roller Rink contact form and confirm a `FormEntry` item is created for tenant `roller-rink-rentals`.
