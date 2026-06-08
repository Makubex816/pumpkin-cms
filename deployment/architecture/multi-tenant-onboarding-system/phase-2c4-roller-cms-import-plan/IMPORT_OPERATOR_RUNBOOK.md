# Import Operator Runbook

This is a runbook for a future separately approved CMS import execution. Do not execute it during Phase 2C-4.

## Planning Preparation

1. Confirm the future approval text names Roller Rink Rentals and the exact CMS import gate.
2. Confirm package, validation report, and support packet paths.
3. Confirm the approval excludes all external systems and live-page publication.
4. Confirm rollback owner and evidence path.
5. Re-run local validation if the package changed.
6. Read the support packet and operator handoff.

## Future Execution Shape

1. Parse the local package.
2. Validate the package again.
3. Confirm no secrets or protected paths.
4. Capture current CMS read state only if separately approved.
5. Create or verify tenant shell only if separately approved.
6. Import the package into draft/preview CMS scope only if separately approved.
7. Capture created/updated CMS IDs.
8. Run CMS readback verification only if separately approved.
9. Write evidence report.
10. Stop before static readiness, production readiness, deployment, email, Search Console, indexing, external checks, or live pages.

## Evidence To Capture Later

- approval text
- package path
- package checksum or file inventory
- validation result
- created/updated CMS IDs
- rollback owner
- rollback target
- readback result
- unresolved gaps

## Operator Stop Points

Stop if secrets appear, approval is ambiguous, package validation fails, rollback target is missing, live-page publication is requested, external systems are requested, or owner responsibility is unclear.
