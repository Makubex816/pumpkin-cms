# Starter Source Build Result

Source: `apps/starter-app`.

Build result: passed.

- `package.json`: present
- `package-lock.json`: present
- `npm ci`: passed
- `npm run type-check`: passed after `.next/types` regenerated
- `npm run build`: passed
- Standalone output: `.next/standalone/server.js` present

Source-supported scripts:

- `type-check`: `tsc --noEmit`
- `build`: `next build`
- `start`: `next start --port 3003`

Deploy fix:

- `apps/starter-app/next.config.js` now sets `output: 'standalone'` so Azure App Service can run `node server.js` and honor runtime port settings.

Build warning:

- Next reported a non-fatal warning that `pumpkin-ts-models/dist/PageJsonConverter.js` references Node `fs` through package exports. The build completed successfully.

Install note:

- `npm ci` reported existing dependency advisories: 1 moderate and 4 high. No dependency mutation was run.
