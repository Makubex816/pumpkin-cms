# API Endpoint Plan

## Future Endpoints Only

These endpoints are planned for later API integration. Phase 2F-2 does not implement or call them.

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| POST | `/api/admin/backups/jobs` | create backup job | backup creator |
| GET | `/api/admin/backups/jobs/{id}` | read job status | scoped viewer/operator |
| GET | `/api/admin/backups/artifacts/{id}/download` | controlled artifact download | scoped download permission |
| POST | `/api/admin/backups/{id}/validate` | enqueue validation | operator |
| POST | `/api/admin/backups/{id}/restore-plan` | enqueue restore dry-run plan | restore operator |
| POST | `/api/admin/backups/escrow-requests` | request escrow creation | escrow requester |
| POST | `/api/admin/backups/escrow-restore-requests` | request escrow restore plan | restore operator plus approver |

## Method Safety

POST endpoints create jobs or requests only. They must not synchronously export data, decrypt escrow, or restore data. Long-running work must be queued and audited.

## Hard Stops

API layer must block:

- standard backup with escrow payload;
- escrow request without approval path;
- download after expiration;
- production restore without later explicit approval;
- secret values in response bodies;
- backup output to public/static directories.
