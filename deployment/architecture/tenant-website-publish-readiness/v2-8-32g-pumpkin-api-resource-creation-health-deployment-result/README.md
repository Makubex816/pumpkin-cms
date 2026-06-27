# V2.8.32G Pumpkin API Resource Creation Health Deployment Result

Date: 2026-06-27

This package records the bounded Path A resource creation retry and health-only deployment attempt for the Pumpkin API live runtime lane.

Status: blocked. The artifact and runtime gates passed, and the resource group was confirmed. The App Service plan creation attempt failed because East US Total VMs quota remains `0` and the deployment requires `1`.

## Package Contents

| File | Purpose |
| --- | --- |
| `result-manifest.json` | Machine-readable phase summary |
| `current-state-summary.md` | Current blocker and resource state |
| `v2-8-32f-carryforward.md` | Prior polling and retry-readiness carryforward |
| `subscription-lock-proof.md` | Locked subscription proof |
| `artifact-reverification-result.md` | Artifact hash and ZIP boundary result |
| `linux-runtime-availability-result.md` | Linux runtime availability result |
| `resource-group-create-confirm-result.md` | Resource group confirm result |
| `app-service-plan-create-confirm-result.md` | App Service plan create/confirm result |
| `webapp-create-confirm-result.md` | Web App create/confirm result |
| `zip-deployment-result.md` | ZIP deployment result |
| `live-health-check-result.md` | Health check result |
| `fallback-diagnosis-result.md` | Blocker diagnosis |
| `unresolvable-classification-if-any.md` | Unresolvable classification |
| `live-api-readiness-summary.md` | Live API readiness summary |
| `future-provider-binding-plan.md` | Future provider-binding plan |
| `rollback-plan.md` | Rollback notes |
| `contact-gate-status.md` | Contact gate status |
| `security-boundary-result.md` | Security boundary result |
| `no-contact-post-no-appsetting-no-protected-config-confirmation.md` | Explicit boundary confirmation |
| `risk-and-open-decisions.md` | Risks and open decisions |
| `next-phase-prompt.md` | Exact next approval prompt |
| `validation-summary.md` | Validation result |
