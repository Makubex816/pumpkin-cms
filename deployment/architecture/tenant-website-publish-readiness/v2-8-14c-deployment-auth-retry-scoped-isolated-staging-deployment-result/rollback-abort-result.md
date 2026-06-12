# Rollback Abort Result

Deployment did not execute, so no rollback action was required.

Abort rule applied:

- Stop before deployment when `SWA_CLI_DEPLOYMENT_TOKEN` is absent.

Future rollback posture:

- If a future deployment executes and route checks fail, do not broadly retry.
- Preserve the previous deployed SWA state until a separately approved rollback or redeploy action.
- Do not delete Azure resources as part of a rollback in this lane without explicit approval.

