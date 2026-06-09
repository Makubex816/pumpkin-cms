# Access Control And Roles

## Roles

| Role | Capabilities |
| --- | --- |
| viewer | view non-sensitive job summaries and validation status |
| operator | create standard backups and validate existing artifacts |
| backup creator | create tenant/full platform standard backups |
| escrow requester | request recovery escrow creation |
| escrow approver | approve or reject escrow creation |
| restore operator | run restore plans and sandbox restore validation |
| super admin | manage recipients, policies, retention, and emergency controls |

## Permission Matrix

| Action | Viewer | Operator | Backup creator | Escrow requester | Escrow approver | Restore operator | Super admin |
| --- | --- | --- | --- | --- | --- | --- | --- |
| View job summaries | yes | yes | yes | yes | yes | yes | yes |
| Create standard tenant backup | no | yes | yes | no | no | no | yes |
| Create full platform backup | no | no | yes | no | no | no | yes |
| Request escrow | no | no | no | yes | no | no | yes |
| Approve escrow | no | no | no | no | yes | no | yes |
| Manage recipient keys | no | no | no | no | no | no | yes |
| Download standard artifact | no | scoped | scoped | no | no | scoped | yes |
| Run restore plan | no | no | no | no | no | yes | yes |
| Approve escrow restore | no | no | no | no | yes | no | yes |

## Separation Of Duties

The same user should not silently request and approve full platform escrow. Multi-party approval is recommended for platform-wide recovery escrow and any production escrow restore.
