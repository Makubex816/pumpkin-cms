# Blockers And Open Decisions

## Blockers

- Staging-backed Admin/API read-only provider bridge is missing.
- Backup Center staging upload adapter/RBAC path is missing.
- API write-action runtime QA needs a clean build/runtime environment because current local build outputs are locked by a running API process.

## Open Decisions

- Whether V2.2.4 should implement a read-only Admin/API staging-backed provider bridge or stay a preflight-only package.
- Whether Backup Center staging upload should receive Storage RBAC and an Azure Identity/RBAC upload adapter in a separate V2.4/V2.5 support lane.
- Whether final V2.2 stage-ready signoff requires browser QA against staging-backed data or accepts local source harness plus live readback evidence.

