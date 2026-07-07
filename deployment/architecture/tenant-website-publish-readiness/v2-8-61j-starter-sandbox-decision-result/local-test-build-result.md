# Local Test Build Result

Status: pass.

Passed:

- `npm install --package-lock-only --ignore-scripts` in `apps/starter-app`.
- `npm ci --ignore-scripts` in `apps/starter-app`.
- `npm run build` in `packages/pumpkin-ts-models`.
- `npm run build` in `packages/pumpkin-block-views`.
- `npm run type-check` in `apps/starter-app`.
- `npm run build` in `apps/starter-app`.
- starter literal JS/MJS/CJS `node --check`.

Warnings:

- npm audit: 5 findings.
- Next build: non-fatal `fs` package export trace warning.

Cleanup:

- starter `node_modules` removed.
- starter `.next` removed.
