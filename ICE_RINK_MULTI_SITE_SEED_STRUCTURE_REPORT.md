# Ice Rink Multi-site Seed Structure Report

## Summary

The local seed/import tool has been refactored to support a future multi-site seed layout while preserving the working `ice-rink-rentals` seed flow.

The existing tool folder remains:

```text
tools/ice-rink-local-seed/
```

The current default seed target remains:

```text
SITE_KEY=ice-rink-rentals
```

If `SITE_KEY` is omitted, validation and seeding default to `ice-rink-rentals`.

## Files Changed

- `tools/ice-rink-local-seed/README.md`
- `tools/ice-rink-local-seed/scripts/validate-seed.mjs`
- `tools/ice-rink-local-seed/scripts/seed-local-cosmos.mjs`

## Files Created

- `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/tenant.template.json`
- `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/theme.json`
- `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/home.json`
- `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/ice-rink-rentals.json`
- `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/events-holiday-activations.json`
- `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/pages/contact.json`
- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/README.md`
- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/tenant.template.json`
- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/theme.placeholder.json`
- `tools/ice-rink-local-seed/seed-sites/second-product-rentals/pages/README.md`
- `ICE_RINK_MULTI_SITE_SEED_STRUCTURE_REPORT.md`

## New Seed Structure

```text
tools/ice-rink-local-seed/
  seed-sites/
    ice-rink-rentals/
      tenant.template.json
      theme.json
      pages/
        home.json
        ice-rink-rentals.json
        events-holiday-activations.json
        contact.json
    second-product-rentals/
      README.md
      tenant.template.json
      theme.placeholder.json
      pages/
        README.md
```

The original `seed/` folder was left in place as a legacy copy, but the updated scripts now read from `seed-sites/{SITE_KEY}`.

## How SITE_KEY Works

- Missing `SITE_KEY` defaults to `ice-rink-rentals`.
- `SITE_KEY=ice-rink-rentals` validates and seeds the existing Ice Rink tenant, theme, and page documents.
- `SITE_KEY=second-product-rentals` validates only placeholder-safe structure and is not seedable yet.
- Unsupported `SITE_KEY` values fail clearly.

## Existing Ice Rink Flow Preserved

The existing commands remain usable:

```powershell
npm run validate
npm run seed
```

`npm run seed` still requires local-only environment variables:

```text
COSMOS_CONNECTION_STRING
ICE_RINK_RENTALS_API_HASH
COSMOS_DATABASE_NAME (optional, defaults to PumpkinCMS)
```

The seed script still upserts into:

- `Tenant`
- `Theme`
- `Page`

## Validation Results

Default validation passed:

```text
Seed validation passed for SITE_KEY=ice-rink-rentals.
Validated tenant template, theme, and 4 page documents.
```

Placeholder second-site validation also passed:

```text
Seed validation passed for SITE_KEY=second-product-rentals.
Validated placeholder-safe tenant/theme structure. No page JSON is present for this placeholder site yet.
```

## Seed Run Status

Seed was not run in this pass.

The local shell did not have the required seed env vars present:

- `COSMOS_CONNECTION_STRING`: not present
- `ICE_RINK_RENTALS_API_HASH`: not present
- `COSMOS_DATABASE_NAME`: not present

No Cosmos data was changed by this refactor.

## Secret Safety

No API keys, API hashes, passwords, Cosmos keys, connection strings, or other secrets were added.

The second-site tenant template uses only a placeholder API hash:

```text
__SECOND_PRODUCT_API_HASH__
```

The existing Ice Rink tenant template still uses:

```text
__ICE_RINK_RENTALS_API_HASH__
```

## Next Recommended Step

When the second product is ready, add real second-site content under `seed-sites/second-product-rentals`, add a site-specific local hash environment variable, mark the second site as seedable in the scripts, and validate that the second-site seed contains no copied Ice Rink copy, URLs, schema, or contact details.
