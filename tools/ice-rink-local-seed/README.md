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
      ice-rink-rentals.json
      events-holiday-activations.json
      contact.json
  second-product-rentals/
    README.md
    tenant.template.json
    theme.json
    pages/
      home.json
      second-product-rentals.json
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

Validate the second-site local proof seed:

```powershell
$env:SITE_KEY = "second-product-rentals"
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
$env:COSMOS_CONNECTION_STRING = "<local-cosmos-emulator-connection-string>"
$env:COSMOS_DATABASE_NAME = "PumpkinCMS"
$env:ICE_RINK_RENTALS_API_HASH = "<bcrypt-api-key-hash-for-local-tenant>"
```

Then run:

```powershell
npm run seed
Remove-Item Env:SITE_KEY
```

`COSMOS_DATABASE_NAME` is optional. If omitted, the script uses `PumpkinCMS`.

## Second-site Local Proof Seed

Generate a second local API key and hash with the existing utility project:

```powershell
cd "$HOME\Desktop\PumpkinCMS\pumpkin-cms"
dotnet run --project apps/pumpkin-api.Tests
```

Copy the generated API hash into the current PowerShell session only:

```powershell
$env:SITE_KEY = "second-product-rentals"
$env:COSMOS_CONNECTION_STRING = "<local-cosmos-emulator-connection-string>"
$env:COSMOS_DATABASE_NAME = "PumpkinCMS"
$env:SECOND_PRODUCT_API_HASH = "<generated-bcrypt-api-key-hash>"
```

Manually add the matching plain API key and tenant values to `apps/ice-rink-web/.env.local`. Do not commit that file.

```text
SECOND_PRODUCT_TENANT_ID=second-product-rentals
SECOND_PRODUCT_API_KEY=<generated-plain-api-key>
SECOND_PRODUCT_CANONICAL_URL=https://second-domain-placeholder.com
```

Seed the second tenant:

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
$apiKey = "<plain-local-api-key>"
$headers = @{ Authorization = "Bearer $apiKey"; Accept = "application/json" }
```

For the second-site proof, use:

```powershell
$tenantId = "second-product-rentals"
$apiKey = "<generated-second-product-plain-api-key>"
$headers = @{ Authorization = "Bearer $apiKey"; Accept = "application/json" }
```

Test pages:

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
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/ice-rink-rentals" -Headers $headers |
  ConvertTo-Json -Depth 80
```

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/events-holiday-activations" -Headers $headers |
  ConvertTo-Json -Depth 80
```

For the second-site proof, also test:

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/second-product-rentals" -Headers $headers |
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
http://localhost:3002/ice-rink-rentals
http://localhost:3002/events-holiday-activations
http://localhost:3002/contact
http://localhost:3002/sitemap.xml
```

Second-site proof URLs:

```text
http://second.localhost:3002/
http://second.localhost:3002/second-product-rentals
http://second.localhost:3002/contact
http://second.localhost:3002/sitemap.xml
```

If `second.localhost` does not resolve on your Windows machine, add a local hosts entry or use a browser/runtime setup that maps `*.localhost` to `127.0.0.1`.

## Notes

- This tool intentionally does not store API keys, API hashes, passwords, Cosmos keys, connection strings, or other secrets in committed files.
- The second-site proof content is generic and marked `noindex, nofollow`; replace it before any production use.
- Keep `apps/ice-rink-web/.env.local` and `apps/pumpkin-api/appsettings.Development.json` local-only.
