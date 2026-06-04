# Architecture Decision

Decision: IceSkatingRinkRentals.com will launch using Azure Static Web App, Azure Cosmos DB, Azure Blob Storage, Cloudflare, and Microsoft 365.

Production request flow:

```text
https://iceskatingrinkrentals.com
  -> Cloudflare DNS/CDN/cache
  -> Azure Static Web App
```

Production media request flow:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/...
  -> Cloudflare CDN/cache
  -> Azure Blob Storage
```

CMS production data flow:

```text
Pumpkin API/Admin
  -> Azure Cosmos DB
```

Email ownership:

```text
Microsoft 365 Exchange Online Plan 1
  -> contact@iceskatingrinkrentals.com
```

Secrets and operational settings:

```text
Azure app settings or Key Vault later
  -> never committed to repo
```

Decision boundaries:

- Pumpkin CMS remains editable after launch.
- Publishing remains manual and approval-gated for launch.
- Production public pages must be generated only from approved live CMS content.
- Draft preview routes remain protected and are not public launch content.
- Media binaries are not stored in Cosmos DB.
- Generated static files are not stored in Cosmos DB.
- Secrets, provider credentials, API keys, deployment tokens, storage keys, and connection strings are not stored in this repo.
