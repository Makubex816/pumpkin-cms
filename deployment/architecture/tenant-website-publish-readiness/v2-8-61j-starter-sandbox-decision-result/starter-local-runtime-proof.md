# Starter Local Runtime Proof

Status: pass.

Passed:

- `npm run type-check`.
- `npm run build`.
- local built server GET proof on `127.0.0.1:3003`.

Local proof environment used placeholder non-secret values only.

| Route | Result |
| --- | --- |
| `/` | HTTP 200 |
| `/admin/login` | HTTP 200 |
| `/admin` | HTTP 200 after redirect to `/admin/login` |
| `/admin/forms` | HTTP 200 after redirect to `/admin/login` |
| `/admin/themes` | HTTP 200 after redirect to `/admin/login` |

Build warning:

- Next build warned about `fs` from `packages/pumpkin-ts-models/dist/PageJsonConverter.js` through the package export trace. Build still completed successfully.

Cleanup:

- `apps/starter-app/node_modules` deleted.
- `apps/starter-app/.next` deleted.
