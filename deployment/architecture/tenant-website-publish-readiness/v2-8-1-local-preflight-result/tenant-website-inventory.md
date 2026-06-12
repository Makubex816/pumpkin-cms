# Tenant Website Inventory

## Discovered Tenant Website App

| Path | Classification | Notes |
| --- | --- | --- |
| `apps/ice-rink-web/` | active tenant website app | Next.js multi-site rental frontend. Static mode supports `ice-rink-rentals` and `roller-rink-rentals`. |
| `tools/ice-rink-local-seed/seed-sites/ice-rink-rentals/` | safe local seed-site content | Current seed content is stale for Ice launch route shape. |
| `tools/ice-rink-local-seed/seed-sites/roller-rink-rentals/` | safe local proof content | Validates locally with warnings but remains paused. |
| `deployment/static-azure/` | static publish planning/tooling | Contains local validators, dry-run tooling, staging runbooks, form strategy, and static deployment guardrails. |
| `deployment/azure/ice-static-form-production-enablement-result/` | historical Ice static proof | CMS-backed export and validators passed on 2026-06-06; not refreshed in V2.8.1. |

## Discovered Tenant States

| Tenant/site key | Domain | State | Evidence |
| --- | --- | --- | --- |
| `ice-rink-rentals` | `iceskatingrinkrentals.com` | active proof tenant, publish blocked | `apps/ice-rink-web/src/config/sites.ts`; static validation failure in V2.8.1. |
| `roller-rink-rentals` | `rollerrinkrentals.com` | paused | `apps/ice-rink-web/src/config/sites.ts`; `deployment/email/README.md`; local validator passed with warnings. |

No tenant was resumed, published, deployed, indexed, or written during this preflight.
