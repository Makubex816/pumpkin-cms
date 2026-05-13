# Ice Rink Local Seed

Local-only seed/import tool for recreating the IceSkatingRinkRentals.com Pumpkin CMS MVP in Cosmos DB.

The tool now uses a multi-site-ready seed layout under `seed-sites/`. The current default and only seedable site is:

```text
SITE_KEY=ice-rink-rentals
```

If `SITE_KEY` is omitted, scripts automatically use `ice-rink-rentals`, preserving the existing workflow.

## Current Seeded Content

For `ice-rink-rentals`, this package upserts:

- `Tenant`: `ice-rink-rentals`
- `Theme`: active local Ice Skating Rink Rentals theme
- `Page`: `home`, `ice-rink-rentals`, `events-holiday-activations`, `contact`

It does not seed `User` or `FormEntry`.

## Seed Structure

```text
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

`second-product-rentals` is placeholder-safe only. It intentionally does not contain real page content, secrets, API hashes, or seedable production data yet.

## Install

From this folder:

```powershell
npm install
```

## Validate Seed Files

Default validation:

```powershell
npm run validate
```

Explicit Ice Rink validation:

```powershell
$env:SITE_KEY = "ice-rink-rentals"
npm run validate
```

The validator checks that:

- No `CMS LIVE:` markers remain.
- No connection strings or obvious secrets are present in seed JSON.
- `tenant.template.json` still uses the expected placeholder API hash.
- All expected page slugs are present for the selected seedable site.
- Each page has required Pumpkin CMS fields.

## Set Local Environment Variables

Set these only in your local PowerShell session. Do not commit them.

```powershell
$env:SITE_KEY = "ice-rink-rentals"
$env:COSMOS_CONNECTION_STRING = "<local-cosmos-emulator-connection-string>"
$env:COSMOS_DATABASE_NAME = "PumpkinCMS"
$env:ICE_RINK_RENTALS_API_HASH = "<bcrypt-api-key-hash-for-local-tenant>"
```

`SITE_KEY` is optional for the current Ice Rink flow. `COSMOS_DATABASE_NAME` is also optional; if omitted, the script uses `PumpkinCMS`.

If the Cosmos Emulator TLS certificate is not trusted by Node, use this only for the current local shell:

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
```

## Run Seed

```powershell
npm run seed
```

The seed command is safe to run more than once. It uses Cosmos `upsert` for the tenant, active theme, and page documents.

`SITE_KEY=second-product-rentals` is not seedable yet and will fail clearly until real second-site content and a local hash workflow are added.

## Test Pumpkin API

Start the API:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\apps\pumpkin-api"
dotnet run
```

Set local request variables. Use the plain local API key that matches the hash used in the tenant seed.

```powershell
$api = "http://localhost:5064"
$tenantId = "ice-rink-rentals"
$apiKey = "<plain-local-api-key>"
$headers = @{ Authorization = "Bearer $apiKey"; Accept = "application/json" }
```

Test pages:

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/home" -Headers $headers |
  ConvertTo-Json -Depth 80
```

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/ice-rink-rentals" -Headers $headers |
  ConvertTo-Json -Depth 80
```

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/events-holiday-activations" -Headers $headers |
  ConvertTo-Json -Depth 80
```

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/contact" -Headers $headers |
  ConvertTo-Json -Depth 80
```

Test active theme:

```powershell
Invoke-RestMethod -Uri "$api/api/themes/$tenantId" -Headers $headers |
  ConvertTo-Json -Depth 80
```

Test sitemap:

```powershell
Invoke-RestMethod -Uri "$api/api/tenant/$tenantId/sitemap" -Headers $headers |
  ConvertTo-Json -Depth 20
```

## Test Frontend

Start the frontend:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\apps\ice-rink-web"
npm run dev
```

Open:

```text
http://localhost:3002/
http://localhost:3002/ice-rink-rentals
http://localhost:3002/events-holiday-activations
http://localhost:3002/contact
http://localhost:3002/sitemap.xml
```

Expected result:

- All four pages render from Pumpkin CMS.
- No `CMS LIVE:` markers are visible.
- `sitemap.xml` includes `/`, `/ice-rink-rentals`, `/events-holiday-activations`, and `/contact`.

## Notes

- This tool intentionally does not store API keys, API hashes, passwords, Cosmos keys, connection strings, or other secrets in committed files.
- Generate local API hashes with the existing `apps/pumpkin-api.Tests` utility.
- Keep `apps/ice-rink-web/.env.local` and `apps/pumpkin-api/appsettings.Development.json` local-only.
