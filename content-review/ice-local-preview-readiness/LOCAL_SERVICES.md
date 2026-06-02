# Local Services

## Pumpkin API

- Folder: `apps/pumpkin-api`
- Start command: `dotnet run`
- Expected URL: `http://localhost:5064`
- Anonymous smoke check: `GET http://localhost:5064/`
- Responsibility: serves Pumpkin CMS pages, themes, tenant sitemap data, form entries, admin endpoints, and MediaAsset endpoints.
- Runtime notes: current project targets `net10.0`; launch settings bind the HTTP profile to `http://localhost:5064`.
- Data dependency: local database/emulator configuration must be available from approved local runtime config. Do not read or print protected config.
- Known blockers: authenticated admin endpoints require a valid admin session/JWT; public content endpoints require tenant API keys supplied through approved runtime environment.

## Admin Next App

- Folder: `apps/admin`
- Start command: `npm run dev`
- Expected URL: `http://localhost:3000`
- Anonymous smoke check: `GET http://localhost:3000/`
- Responsibility: authenticated CMS admin, page manager, import/export, media library, media picker, lead inbox, and publishing readiness UI.
- Runtime notes: uses `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:5064` in code when unset.
- Known blockers: meaningful admin inspection requires login. This package did not log in or read tokens.

## Ice Public Next App

- Folder: `apps/ice-rink-web`
- Start command: `npm run dev`
- Expected URL: `http://localhost:3002`
- Safe route checks:
  - `GET http://localhost:3002/`
  - `GET http://localhost:3002/contact`
  - `GET http://localhost:3002/service-areas`
- Responsibility: public runtime renderer for Ice and Roller tenant sites. `localhost:3002` resolves to Ice.
- Runtime notes: runtime mode fetches CMS pages/themes through `PUMPKIN_API_URL`, defaulting to `http://localhost:5064`. If CMS content or API credentials are unavailable, the app can fall back to local Ice home/contact content where fallback pages exist.
- Known blockers: the new normalized homepage candidate is not wired into the runtime route unless imported into CMS or loaded through a future dedicated preview path.

## Static Form Endpoint Local Server

- Folder: `deployment/static-azure/forms/static-form-endpoint`
- Start command: `npm run start:local`
- Expected URL: `http://localhost:7072/api/contact`
- Safe non-mutating probe: `GET http://localhost:7072/api/contact` only confirms whether a listener exists; functional tests require POST and were not run here.
- Responsibility: local-only static form endpoint foundation for future static exports.
- Recommended local dry-run setting: `STATIC_FORM_FORWARD_MODE=dry-run`
- Known blockers: forwarding to Pumpkin API requires API URL and tenant API keys supplied outside the repo. This package did not send a form.

## Cosmos Emulator / Local Database

- Folder: external local service, not part of this repo.
- Expected dependency: Pumpkin API needs an approved local database/emulator setup to serve persisted CMS records.
- Confirmation: use existing local developer workflow. Do not read `appsettings.Development.json` or print connection strings.
- Known blockers: if the database/emulator is down or credentials are missing, API-backed CMS pages and admin features may not work; the public app may fall back where fallback content exists.

