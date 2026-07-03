# Admin UI Build And Deploy Result

Result: pass.

Build:

- `npm run build` in `apps/admin`: passed.
- `npm run type-check` in `apps/admin`: passed when run serially after build.
- Existing build warnings remained in unrelated pages plus an existing `pumpkin-ts-models` server-side module warning; build completed.

Artifact:

- `.tmp/v2-8-58c/artifacts/admin-ui-v2-8-58c.zip`
- Entries: 2007.
- Root `server.js`: present.
- Root `package.json`: present.
- `.next/static`: present.
- POSIX entry check: pass.
- Protected config entries: 0.

Isolated deployment:

- Web App: `app-pumpkin-admin-isolated-centralus-001`
- Attempts: 1.
- Deployment ID: `a7d23f29-685c-44ad-bc0b-d065c1152548`
- Status: `RuntimeSuccessful`
- Isolated route proof: `/`, `/login`, `/dashboard`, `/dashboard/onboarding`, `/dashboard/users` all HTTP 200.

Production deployment:

- Web App: `app-pumpkin-admin-prod-centralus-001`
- Attempts: 1.
- Deployment ID: `c151495a-4b5e-4dd6-aaa9-c25bb38de354`
- Status: `RuntimeSuccessful`
- Production route proof: `/`, `/login`, `/dashboard`, `/dashboard/onboarding`, `/dashboard/users` all HTTP 200.

