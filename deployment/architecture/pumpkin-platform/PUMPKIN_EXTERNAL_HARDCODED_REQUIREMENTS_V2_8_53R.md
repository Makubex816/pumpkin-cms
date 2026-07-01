# Pumpkin External Hard-Coded Requirements V2.8.53R

## Must Keep

- Keep external route contract stable:
  - `/api/pages/{tenantId}/{pageSlug}`
  - `/api/forms/{tenantId}/entries`
  - `/api/forms/{tenantId}/submit/{type}`
  - `/api/themes/{tenantId}`
  - `/api/auth/login`
  - `/api/admin/forms/{tenantId}/entries`
- Keep tenant partition assumptions around `tenantId`.
- Keep source Cosmos container compatibility for `Tenant`, `Page`, `User`, `Theme`, and `FormEntry`.
- Keep API-key Bearer auth for public tenant content routes.
- Keep JWT auth for admin routes.

## Current Hard-Coded Items To Remediate

| Item | Source Evidence | Requirement |
| --- | --- | --- |
| Provider metadata is Ice-only | `ProviderMetadataService` hard-codes `ice-rink-rentals`. | Convert to tenant profile registry before more tenants. |
| Static site keys are Ice/Roller-only | `render-mode.ts` allows only Ice/Roller. | Add data-driven site profile lookup or explicit approved tenant entries. |
| Static contact default is Ice-only | `render-mode.ts` defaults `/api/static-contact` only for Ice. | Tenant package contact config must drive this. |
| Static fallback pages are Ice-only | `content-source.ts` has recovered Ice slugs. | Secondary tenant static generation must not depend on Ice fallback. |
| Admin publishing profiles are Ice/Roller-only | `publishing-readiness.ts` maps Ice/Roller. | Add package-driven publish profile registry. |
| Design system guard contains Ice-specific checks | `DesignSystemGuard` references Ice tenant checks. | Guard must become tenant-profile aware. |

## Compatibility Rule

Prefer adapters, aliases, and data-driven tenant profile registries over breaking external route, model, or database assumptions.
