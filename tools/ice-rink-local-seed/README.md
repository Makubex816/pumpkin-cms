# Ice Rink Local Seed

Local-only seed/import tool for recreating rental-site Pumpkin CMS tenants in Cosmos DB.

The default site remains:

```text
SITE_KEY=ice-rink-rentals
```

If `SITE_KEY` is omitted, scripts use `ice-rink-rentals`, preserving the existing IceSkatingRinkRentals.com workflow.

## Seed Structure

```text
seed-sites/
  ice-rink-rentals/
    tenant.template.json
    theme.json
    pages/
      home.json
      contact.json
      service-areas.json
  roller-rink-rentals/
    README.md
    tenant.template.json
    theme.json
    pages/
      home.json
      roller-rink-rentals.json
      contact.json
```

Both site folders use placeholder API hashes in committed JSON. Real hashes are supplied only through local environment variables at seed time.

## Install

From this folder:

```powershell
npm install
```

## Validate Seed Files

Validate the default Ice Rink seed:

```powershell
npm run validate
```

Validate explicitly:

```powershell
$env:SITE_KEY = "ice-rink-rentals"
npm run validate
Remove-Item Env:SITE_KEY
```

Validate the Roller Rink local proof seed:

```powershell
$env:SITE_KEY = "roller-rink-rentals"
npm run validate
Remove-Item Env:SITE_KEY
```

The validator checks that:

- No `CMS LIVE:` markers remain.
- No connection strings or obvious secrets are present in seed JSON.
- `tenant.template.json` still uses the expected placeholder API hash.
- All expected page slugs are present for the selected site.
- Each page has required Pumpkin CMS fields.

## Ice Rink Seed

Set these only in your local PowerShell session. Do not commit them.

```powershell
$env:SITE_KEY = "ice-rink-rentals"
$env:COSMOS_CONNECTION_STRING = Read-Host "Paste the local Cosmos emulator connection string for this shell"
$env:COSMOS_DATABASE_NAME = "PumpkinCMS"
$env:ICE_RINK_RENTALS_API_HASH = Read-Host "Paste the local Ice API hash for this shell"
```

Then run:

```powershell
npm run seed
Remove-Item Env:SITE_KEY
```

`COSMOS_DATABASE_NAME` is optional. If omitted, the script uses `PumpkinCMS`.

## Roller Rink Local Proof Seed

Generate a new Roller Rink local API key and hash with the existing utility project:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms"
dotnet run --project apps/pumpkin-api.Tests
```

Copy the generated API hash into the current PowerShell session only:

```powershell
$env:SITE_KEY = "roller-rink-rentals"
$env:COSMOS_CONNECTION_STRING = Read-Host "Paste the local Cosmos emulator connection string for this shell"
$env:COSMOS_DATABASE_NAME = "PumpkinCMS"
$env:ROLLER_RINK_RENTALS_API_HASH = Read-Host "Paste the generated local Roller API hash for this shell"
```

Manually add the matching plain API key and tenant values to `apps/ice-rink-web/.env.local`. Do not commit that file.

```text
ROLLER_RINK_RENTALS_TENANT_ID=roller-rink-rentals
ROLLER_RINK_RENTALS_API_KEY=<generated-plain-api-key>
ROLLER_RINK_RENTALS_CANONICAL_URL=https://rollerrinkrentals.com
```

Seed the roller tenant:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\tools\ice-rink-local-seed"
npm run validate
npm run seed
Remove-Item Env:SITE_KEY
```

If the Cosmos Emulator TLS certificate is not trusted by Node, use this only for the current local shell:

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
```

## Test Pumpkin API

Start the API:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms\apps\pumpkin-api"
dotnet run
```

Set local request variables. Use the plain local API key that matches the seeded tenant hash.

```powershell
$api = "http://localhost:5064"
$tenantId = "ice-rink-rentals"
$plainLocalApiKey = Read-Host "Paste the local-only Ice API key for this shell"
$headers = @{ Authorization = "Bearer $plainLocalApiKey"; Accept = "application/json" }
```

For the Roller Rink proof, use:

```powershell
$tenantId = "roller-rink-rentals"
$plainLocalApiKey = Read-Host "Paste the local-only Roller API key for this shell"
$headers = @{ Authorization = "Bearer $plainLocalApiKey"; Accept = "application/json" }
```

Test shared pages:

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/home" -Headers $headers |
  ConvertTo-Json -Depth 80
```

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/contact" -Headers $headers |
  ConvertTo-Json -Depth 80
```

For Ice Rink, also test:

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/service-areas" -Headers $headers |
  ConvertTo-Json -Depth 80
```

For Roller Rink, also test:

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/roller-rink-rentals" -Headers $headers |
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

Ice Rink URLs:

```text
http://localhost:3002/
http://localhost:3002/contact
http://localhost:3002/service-areas
http://localhost:3002/sitemap.xml
```

Roller Rink URLs:

```text
http://roller.localhost:3002/
http://roller.localhost:3002/roller-rink-rentals
http://roller.localhost:3002/contact
http://roller.localhost:3002/sitemap.xml
```

If `roller.localhost` does not resolve on your Windows machine, add a local hosts entry or use a browser/runtime setup that maps `*.localhost` to `127.0.0.1`.

## Notes

- This tool intentionally does not store API keys, API hashes, passwords, Cosmos keys, connection strings, or other secrets in committed files.
- The Roller Rink proof content is realistic enough for local testing but still needs final production review.
- Keep `apps/ice-rink-web/.env.local` and `apps/pumpkin-api/appsettings.Development.json` local-only.
