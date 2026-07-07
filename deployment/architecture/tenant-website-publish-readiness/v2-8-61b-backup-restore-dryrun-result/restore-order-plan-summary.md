# Restore Order Plan Summary

Status: generated.

Outside-repo restore order plan:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\tenant-backups\v2-8-61b-airstrip-restore-dryrun-proof\RESTORE_ORDER_PLAN.json`

Plan summary:

- Steps: 15.
- Dry-run only: true.
- Live execution approved: false.
- Live actions taken: false.

High-level order:

1. Validate manifest and checksums.
2. Prepare target tenant identity plan.
3. Restore tenant.
4. Restore sanitized users or require password reset.
5. Restore themes.
6. Restore FormDefinitions.
7. Restore pages.
8. Restore MediaAsset records after media blob plan.
9. Restore FormEntries if policy allows.
10. Restore ImportRun/PublishRun history if policy allows.
11. Restore DomainBindings as pending/non-live.
12. Restore media blobs.
13. Restore website files.
14. Rebuild or redeploy runtime only in a later approved phase.
15. Run responsive checker before production use.
