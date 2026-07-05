# Admin UI Typecheck Build Result

Status: passed.

Commands:

- `npm --prefix apps/admin run type-check`: passed.
- `npm --prefix apps/admin run build`: passed.

Build warnings:

- Existing React hook dependency warnings in unrelated Admin pages.
- Existing `pumpkin-ts-models` server-side `fs` warning.

New route emitted by build:

- `/dashboard/onboarding/domains`

Artifact validation:

- POSIX ZIP entries: passed.
- Entry count: 2014.
- Root `server.js`: present.
- Root `package.json`: present.
- `.next/static`: present.
- `.next/server`: present.
- Protected config entries: 0.
