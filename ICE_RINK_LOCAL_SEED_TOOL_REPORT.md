# Ice Rink Local Seed Tool Report

## Summary

Created a local-only repeatable seed/import package for the IceSkatingRinkRentals.com Pumpkin CMS MVP. The tool can validate committed seed JSON and, when local secrets are supplied through environment variables, upsert the `ice-rink-rentals` tenant, active theme, and four published CMS pages into Cosmos DB.

No Pumpkin API, admin app, shared model package, shared block package, `.env.local`, or `appsettings.Development.json` files were modified.

## Files Created

- `tools/ice-rink-local-seed/README.md`
- `tools/ice-rink-local-seed/package.json`
- `tools/ice-rink-local-seed/package-lock.json`
- `tools/ice-rink-local-seed/seed/tenant.template.json`
- `tools/ice-rink-local-seed/seed/theme.json`
- `tools/ice-rink-local-seed/seed/pages/home.json`
- `tools/ice-rink-local-seed/seed/pages/ice-rink-rentals.json`
- `tools/ice-rink-local-seed/seed/pages/events-holiday-activations.json`
- `tools/ice-rink-local-seed/seed/pages/contact.json`
- `tools/ice-rink-local-seed/scripts/validate-seed.mjs`
- `tools/ice-rink-local-seed/scripts/seed-local-cosmos.mjs`
- `ICE_RINK_LOCAL_SEED_TOOL_REPORT.md`

## What The Tool Does

The package provides two npm scripts:

```powershell
npm run validate
npm run seed
```

`npm run validate` checks the committed seed files for:

- No `CMS LIVE:` markers.
- No obvious committed secrets such as Cosmos connection strings, account keys, JWT-like tokens, or BCrypt hashes.
- Tenant template still using `__ICE_RINK_RENTALS_API_HASH__`.
- Required page fields and expected page slugs.

`npm run seed` uses `@azure/cosmos` to upsert:

- `Tenant`: `ice-rink-rentals`
- `Theme`: `ice-rink-rentals-default`
- `Page`: `home`, `ice-rink-rentals`, `events-holiday-activations`, `contact`

The seed command is repeatable because it uses Cosmos `upsert`.

## Required Env Vars

Required to run the seed writer:

```powershell
$env:COSMOS_CONNECTION_STRING = "<local-cosmos-emulator-connection-string>"
$env:ICE_RINK_RENTALS_API_HASH = "<bcrypt-api-key-hash-for-local-tenant>"
```

Optional:

```powershell
$env:COSMOS_DATABASE_NAME = "PumpkinCMS"
```

If `COSMOS_DATABASE_NAME` is not set, the seed script defaults to `PumpkinCMS`.

## Validation Results

Ran:

```powershell
cd tools/ice-rink-local-seed
npm install
npm run validate
```

Result:

```text
Seed validation passed.
Validated tenant template, theme, and 4 page documents.
```

`npm install` completed successfully and reported `0 vulnerabilities`.

## Seed Run Status

The seed writer was not run because the required local environment variables were not present in this shell:

- `COSMOS_CONNECTION_STRING`: not set
- `ICE_RINK_RENTALS_API_HASH`: not set

This is intentional. The tool should only write to Cosmos after the local operator supplies secrets through their shell environment.

## Warnings

- The tool does not create Cosmos databases or containers. It expects `PumpkinCMS` and containers `Tenant`, `Theme`, and `Page` to already exist.
- The tool does not seed `User` or `FormEntry`.
- If Node rejects the Cosmos Emulator TLS certificate, the README includes a local-only `NODE_TLS_REJECT_UNAUTHORIZED=0` workaround for the current shell.
- The seed content is clean of `CMS LIVE:` markers and is intended for the local MVP baseline.

## Next Steps

1. Set `COSMOS_CONNECTION_STRING` and `ICE_RINK_RENTALS_API_HASH` locally in PowerShell.
2. Run `npm run seed` from `tools/ice-rink-local-seed`.
3. Verify Pumpkin API page, theme, and sitemap endpoints.
4. Verify the frontend at `http://localhost:3002`.
5. Decide whether to add optional admin-user seeding in a future local-only iteration.
