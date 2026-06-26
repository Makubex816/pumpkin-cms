# Local Contact Validation Result

Passed:

- `npm run check` in `deployment/static-azure/forms/static-form-endpoint-compat`.
- `npm test` in `deployment/static-azure/forms/static-form-endpoint-compat`.
- `npm run check` in `deployment/static-azure/forms/static-form-endpoint`.
- `npm test` in `deployment/static-azure/forms/static-form-endpoint`.
- `node --check deployment/static-azure/scripts/ice-isolated-swa-deploy-readiness.mjs`.
- `npm run type-check` in `apps/ice-rink-web`.
- `npm run validate:static:ice` in `apps/ice-rink-web`.
- `npm run build:static:ice:sanitized` in `apps/ice-rink-web`.

Static validation warning state:

- `npm run validate:static:ice` passed with 34 existing content-readiness warnings.

Sanitized build:

- Run ID: `sanitized_20260626132555`.
- Protected config copied: false.
- Protected config reference in command output: false.
- Child build environment allowlist: true.
