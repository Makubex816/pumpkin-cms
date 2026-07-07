# Starter App Resource And Proof State

Current state:

- Source path: `apps/starter-app`.
- Deployment state: not deployed.
- Runtime proof state: local-only proof passed in V2.8.61J.
- Lockfile state: `apps/starter-app/package-lock.json` exists from V2.8.61J and was committed with force-add because repo ignore rules cover app lockfiles.
- Admin boundary: starter `/admin` is tenant-local only.
- Platform control plane: standalone `apps/admin` remains the platform/SuperAdmin control plane.

V2.8.61J local proof:

- `npm run type-check`: passed.
- `npm run build`: passed with a non-fatal package export warning about `fs` through `PageJsonConverter`.
- Local GET proof passed for `/`, `/admin/login`, `/admin`, `/admin/forms`, and `/admin/themes`.

Existing-resource sandbox decision:

- V2.8.61J chose local-only proof.
- Future Azure proof needs separate approval.
- Airstrip must not be used as a starter sandbox.
- The best future candidate for a full Next server proof is `app-pumpkin-admin-isolated-centralus-001`, but only under separate approval, backup/rollback, and proof that production Admin UI remains unaffected.

No starter deploy occurred in V2.8.61K.
