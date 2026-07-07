# Pumpkin Backup Onboarding Operator Runbook V2.8.61F

This runbook describes the current local/operator-assisted process proven in V2.8.61F.

Operator steps:

1. Confirm the approved secure file exists under ignored `.tmp`.
2. Run the V2.8.61F orchestrator:

   `node deployment/architecture/pumpkin-platform/operator-workflows/v2-8-61f/airstrip-backup-intake-e2e.mjs`

3. Confirm the outside proof bundle exists under:

   `C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\operator-workflow-proofs\v2-8-61f-airstrip-backup-intake-e2e`

4. Confirm `OPERATOR_E2E_RESULT.json` reports `completed_success`.
5. Confirm `OPERATOR_E2E_CHECKSUMS.sha256` validates.
6. Review Admin UI Backup Manager and Package Intake pages as SuperAdmin.
7. Confirm TenantAdmin denial.
8. Do not proceed to DNS/custom-domain work without the next explicit owner approval.

Current boundaries:

- Local/operator-assisted execution only.
- Admin UI review only.
- No browser-side backup/package execution controls.
- No live restore, deploy, DNS/custom-domain action, contact/form submission, package build, media upload, or content mutation.
