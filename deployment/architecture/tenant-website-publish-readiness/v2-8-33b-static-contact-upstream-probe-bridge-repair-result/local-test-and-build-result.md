# Local Test And Build Result

Static contact compat:

- `npm run check`: passed.
- `npm test`: passed.
- Test count observed: 12 passing checks.

Ice frontend:

- `npm run type-check`: passed.
- `npm run validate:static:ice`: passed with 34 existing content warnings.
- `npm run build:static:ice:sanitized`: passed.

Sanitized build:

- Run ID: `sanitized_20260629015413`.
- Protected config copied: false.
- Static validate, Next build, and static generate: passed.

Package:

- Package root: `.tmp/v2-8-33b/artifacts/swa-package`.
- App files: 42.
- API files: 12.
- Repaired handler included: yes.
- Contact page uses `/api/static-contact`: yes.
- Contact page uses `/api/contact`: no.
- Contact page contains public contact email: yes.
