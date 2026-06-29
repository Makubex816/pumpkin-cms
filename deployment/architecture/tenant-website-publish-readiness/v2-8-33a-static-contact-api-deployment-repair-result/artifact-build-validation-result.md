# Artifact Build Validation Result

Commands run:

- `npm run type-check` from `apps/ice-rink-web`: passed.
- `npm run validate:static:ice` from `apps/ice-rink-web`: passed with 34 existing content warnings.
- `npm run build:static:ice:sanitized` from `apps/ice-rink-web`: passed.

Sanitized build:

- Run ID: `sanitized_20260629005557`.
- Protected config copied into sanitized workspace: no.
- Static validate, Next build, and static generate steps: passed.

SWA package:

- Package root: `.tmp/v2-8-33a/artifacts/swa-package/`.
- App file count: 42.
- API file count: 11.
- App includes `staticwebapp.config.json`.
- API includes `host.json`.

Artifact checks:

- Contact page exists: yes.
- Home exists: yes.
- Service areas page exists: yes.
- Contact page uses `/api/static-contact`: yes.
- Contact page uses `/api/contact`: no.
- Contact page contains `contact@iceskatingrinkrentals.com`: yes.
- Artifact uses Azure-hosted media URLs: yes.

Additional note:

The older generic static-output validator still flags the current Azure Blob media host because it expects the custom media host policy. That validator returned `failed_local_static_integrity`; the task-specific SWA package readiness and contact deployment checks passed. Because the phase later blocked on isolated POST HTTP 502, production was not reached.
