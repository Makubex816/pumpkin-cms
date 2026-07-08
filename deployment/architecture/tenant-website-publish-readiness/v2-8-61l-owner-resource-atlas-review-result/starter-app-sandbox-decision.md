# Starter App Sandbox Decision

Default state: local-only until separate approval.

Current state:

- `apps/starter-app` exists in source.
- V2.8.61J local runtime proof passed.
- Starter `/admin` is tenant-local only.
- Starter app is not deployed to Azure.
- Airstrip must not be used as a starter sandbox.

Future phase:

- V2.8.61Q Starter app existing-resource sandbox proof.

Required before proof:

- Separate owner approval.
- Existing non-Airstrip resource target selection.
- Backup/rollback plan.
- Proof that production Admin UI remains unaffected.
- No new Azure resources unless separately approved.

Blocked now:

- Starter deploy.
- New resource creation.
- Airstrip sandbox use.
- Replacement of standalone Admin UI.
