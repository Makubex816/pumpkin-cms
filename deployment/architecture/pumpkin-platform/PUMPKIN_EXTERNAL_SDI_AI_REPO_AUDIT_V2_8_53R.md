# Pumpkin External SDI-AI Repo Audit V2.8.53R

## Reference Lock

| Field | Value |
| --- | --- |
| Remote | `https://github.com/SDI-AI/pumpkin-cms` |
| Local reference | `C:\Users\User\Desktop\PumpkinCMS\external-reference\SDI-AI-pumpkin-cms` |
| Branch | `main` |
| Commit | `947cf05a1b6fbf1721bc3c112e1052f0c6c59b8a` |
| Commit date | `2026-05-27T14:48:34-04:00` |
| File count | 188 |

## Architecture

The external repository defines the core Pumpkin CMS contract:

- API-first .NET `pumpkin-api`.
- Shared .NET model library.
- TypeScript model package.
- Reusable block view package.
- Next.js admin app.
- Next.js sample app.

The source targets .NET 10 even though README prose still mentions .NET 9.0.

## Core External Assumptions

- Tenant isolation is by `tenantId`.
- Public page reads use `/api/pages/{tenantId}/{pageSlug}`.
- Public page writes use `/api/pages/{tenantId}` and `/api/pages/{tenantId}/{pageSlug}`.
- Public form entry intake includes `/api/forms/{tenantId}/entries`.
- External also includes ergonomic form submit route `/api/forms/{tenantId}/submit/{type}`.
- Public theme reads use `/api/themes/{tenantId}` and `/api/themes/{tenantId}/{themeId}`.
- Auth login is `/api/auth/login` with JWT returned for admin routes.
- Admin routes use JWT and tenant/role checks.
- Cosmos source container names are singular Pascal-style: `Tenant`, `Page`, `User`, `Theme`, `FormEntry`.

## Current Build Relationship

The current build should be treated as an additive compatibility branch. It has live Ice tenant proof, static contact recovery, Admin UI, media, publish/import run tracking, tenant package contract, and protected backup proof. It must not break the external route/model/container assumptions.
