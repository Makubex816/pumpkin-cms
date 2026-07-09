# Safe Delete Candidates

Status: candidates only; not executed.

Only ignored cache/build outputs are classified as safe delete candidates for later approval.

Exact-path candidates:

- `apps/admin/.next`
- `apps/admin/node_modules`
- `apps/admin/tsconfig.tsbuildinfo`
- `apps/ice-rink-web/node_modules`
- `apps/ice-rink-web/tsconfig.tsbuildinfo`
- `apps/pumpkin-api/bin`
- `apps/pumpkin-api/obj`
- `apps/pumpkin-api.Tests/bin`
- `apps/pumpkin-api.Tests/obj`
- `packages/pumpkin-ts-models/node_modules`
- `test-results`

Not safe for broad deletion:

- `.tmp`
- `secure-operator-handoff`
- `tenant-onboarding-intake`
- `visual-review`
- `external-reference`
- `tenant-backups`
- `content-review`
- tracked `packages/pumpkin-ts-models/dist`

Reason:

- The safe candidates are reproducible caches/build outputs or proof-output scratch paths.
- Protected/tenant/package/reference paths may contain owner artifacts or sensitive context and require explicit owner decision.
