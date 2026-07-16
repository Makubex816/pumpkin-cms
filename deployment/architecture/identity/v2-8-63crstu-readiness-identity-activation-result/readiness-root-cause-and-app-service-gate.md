# Readiness root cause and App Service gate

CRSTUR carried forward the CRST readiness correction: liveness and dependency readiness are separate, and App Service warmup/swap acceptance use `/health/ready` with HTTP 200 only.

The earlier CRSTU interruption was not a product hard gate. The actionable runner defect was a control-plane convergence race: an App Service setting update returned successfully, but the runner immediately read stale appsettings and failed closed before Stage 2 API mutation. CRSTUR treated immediate stale readback as pending convergence and required bounded polling of:

- Azure appsetting readback,
- runtime `/api/identity/feature-state`,
- both affinity-pinned workers, and
- readiness 200 after each runner-owned flag change.

The repaired runner recorded command-return timestamps, control-plane convergence, worker feature-state convergence, and per-stage two-worker readiness. Attempt 11 completed Stages 2-7 with `readiness200OnTwoWorkersAfterEveryRunnerOwnedFlag=true`.

Final closeout evidence:

- `.tmp/v2-8-63crstu/evidence/identity-management-stages-attempt-11/*-control-convergence.json`
- `.tmp/v2-8-63crstu/evidence/identity-management-stages-attempt-11/*-feature-convergence.json`
- `.tmp/v2-8-63crstu/evidence/final-closeout-control-plane/two-worker-feature-state-after-capacity-diagnostics-disabled.json`

Final App Service warmup settings remain:

- `WEBSITE_WARMUP_PATH=/health/ready`
- `WEBSITE_WARMUP_STATUSES=200`
- `WEBSITE_SWAP_WARMUP_PING_PATH=/health/ready`
- `WEBSITE_SWAP_WARMUP_PING_STATUSES=200`

The rollback slot remains preserved as the rollback target and was not deleted or repurposed.
