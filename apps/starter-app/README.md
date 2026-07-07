# Pumpkin Starter App

Blank phase-1 tenant app for Pumpkin CMS.

## Purpose

When a generated app has no tenant binding, it reports that configuration is missing. It does not provide an in-app setup form. Deployed apps should already have tenant configuration in platform app settings or environment variables. This app assumes the tenant already exists in the Pumpkin database. It does not create tenants, databases, or containers.

## Config Storage

Phase 1 reads two config sources:

1. Environment variables for deployed/generated environments. This is the required production path:

```env
NEXT_PUBLIC_PUMPKIN_API_URL=http://localhost:5064
PUMPKIN_TENANT_ID=existing-tenant-id
PUMPKIN_API_KEY=existing-tenant-api-key
PUMPKIN_SITE_NAME=Optional Site Name
```

2. Optional local development file written before app startup by a CLI or developer:

```txt
config/tenant.local.json
```

The app does not write this file. It is gitignored because it can contain a tenant API key.

In `NODE_ENV=production`, the app does not read `config/tenant.local.json`. If the environment variables are missing, it shows a deployment configuration error.

## Deployment App Settings

Initial deployments should bind these settings before first boot through the active repo's approved operator runbooks:

- `NEXT_PUBLIC_PUMPKIN_API_URL`
- `PUMPKIN_TENANT_ID`
- `PUMPKIN_API_KEY`
- `PUMPKIN_SITE_NAME`

## Run

```bash
cd apps/starter-app
npm install
npm run dev
```

Open http://localhost:3003.

The tenant-local admin shell is available at http://localhost:3003/admin. It uses Pumpkin admin accounts and stores the JWT in an HTTP-only cookie.

## Admin Boundary

Starter `/admin` is a tenant-site-local admin surface. It is not the Pumpkin platform/SuperAdmin control plane, and it must not replace the standalone Admin UI in `apps/admin`.

Allowed tenant-local workflows:

- dashboard
- pages
- page map
- forms
- themes

Denied platform controls:

- Backup Manager
- Package Intake or Universal Onboarding
- Domain Manager
- users/admins platform management
- hardcopy, recovery, or resource controls
- cross-tenant operations

The source allowlist for starter admin workflows lives in `src/lib/starter-admin-boundary.ts`.

## Phase 1 Boundary

- Do not create containers.
- Do not create tenants.
- Do not seed pages.
- Do not configure the tenant from the app UI.
- Only read the app-to-existing-tenant binding supplied before startup.
