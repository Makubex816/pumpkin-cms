# V2.8.24 Contact Function v4 Entrypoint Isolated Staging Result

Status: completed with isolated POST still blocked.

This package records the isolated-only V2.8.24 remediation attempt for the Static Web Apps managed contact API. The prepared CommonJS Azure Functions v4 entrypoint was deployed once to `swa-ice-static-isolated-staging` with the app-plus-API shape. The static app and preflight checks passed, but the single approved synthetic POST to `/api/static-contact` still returned 404 with an empty body.

Key result:

- Deployment succeeded exactly once.
- `/contact` remained correctly wired to `/api/static-contact`.
- `OPTIONS /api/static-contact` returned 204.
- `POST /api/static-contact` returned 404.
- No retry was sent.
- No production deployment or production POST occurred.

Production remains blocked.
