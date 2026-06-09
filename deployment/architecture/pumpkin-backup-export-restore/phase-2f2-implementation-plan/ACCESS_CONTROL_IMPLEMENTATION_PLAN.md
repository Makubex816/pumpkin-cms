# Access Control Implementation Plan

## Roles

- `viewer`
- `operator`
- `backup_creator`
- `escrow_requester`
- `escrow_approver`
- `restore_operator`
- `super_admin`

## Permission Gates

| Action | Required permission |
| --- | --- |
| View job summary | scoped view |
| Create tenant standard backup | backup create |
| Create platform standard backup | platform backup create |
| Download artifact | artifact download plus scope |
| Validate backup | backup validate |
| Create restore plan | restore plan |
| Request escrow | escrow request |
| Approve escrow | escrow approve |
| Request escrow restore | escrow restore request |
| Manage recipients | super admin |

## Phase 2F-3 Local Plan

Local prototype can model `actor` and `role` as non-secret command inputs for audit records. It should not claim production RBAC.

## Later API Plan

API integration must use the admin auth/RBAC model and enforce tenant scope before job creation, download, validation, restore planning, or escrow workflows.
