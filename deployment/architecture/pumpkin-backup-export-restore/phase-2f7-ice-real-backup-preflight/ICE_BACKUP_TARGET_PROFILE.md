# Ice Backup Target Profile

## Identity

| Field | Value |
| --- | --- |
| Tenant display name | Ice Skating Rink Rentals |
| Site key | `ice-rink-rentals` |
| Primary domain | `iceskatingrinkrentals.com` |
| `www` domain | `www.iceskatingrinkrentals.com` |
| Media domain | `media.iceskatingrinkrentals.com` |
| Static Web App | `swa-ice-static-staging` |
| Static Web App default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| Form Function App | `func-ice-static-contact-20260605` |
| Form resource group | `rg-ice-static-form-endpoint` |

## Route Scope

Approved live routes:

- `/`
- `/contact`
- `/service-areas`

Known obsolete routes expected to remain 404:

- `/ice-rink-rentals`
- `/events-holiday-activations`

## Media Scope

Public media delivery is through:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Prior safe evidence validated 9 approved media URLs through the media domain.

## Current Status

| Area | Status |
| --- | --- |
| Production custom-domain cutover | complete |
| Production smoke | passed in prior safe evidence |
| Strict static output validator | passed in prior safe evidence |
| Strict staging package validator | passed in prior safe evidence |
| Live production indexing readiness | technically ready in prior safe evidence |
| Search Console/indexing | hard-stopped pending final owner approval |
| Manual owner review | package created, signoff pending |
| Roller track | paused behind Backup Center |

## Backup Rationale

Ice is the correct first real Backup Center proof target because it is the completed live tenant, has known route/media/form/static evidence, and remains hard-stopped before Search Console/indexing. A full backup proof before further high-risk launch work gives the project a recovery baseline.
