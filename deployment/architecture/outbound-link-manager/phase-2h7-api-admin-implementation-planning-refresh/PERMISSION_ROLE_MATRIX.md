# Permission Role Matrix

| Capability | SuperAdmin | TenantAdmin | Operator | ContentEditor | Viewer | SystemScanner | BackupOperator |
| --- | --- | --- | --- | --- | --- | --- | --- |
| View tenant links | yes | assigned tenant | assigned tenant | assigned tenant | assigned tenant | no | assigned tenant |
| View instances | yes | assigned tenant | assigned tenant | assigned tenant | assigned tenant | no | assigned tenant |
| View policies | yes | assigned tenant | assigned tenant | assigned tenant | assigned tenant | no | assigned tenant |
| View audit log | yes | assigned tenant | assigned tenant | no | read-only summary | no | assigned tenant summary |
| Prepare scan run | yes | assigned tenant | assigned tenant | no | no | controlled path | no |
| Execute scan run | future gate | future gate | future gate | no | no | controlled path | no |
| Change link status | future gate | future gate | request only | request only | no | no | no |
| Change instance status | future gate | future gate | request only | request only | no | no | no |
| Update policy | future gate | future gate | no | no | no | no | no |
| Preview bulk action | yes | assigned tenant | assigned tenant | no | no | no | no |
| Execute bulk action | future gate | future gate | no | no | no | no | no |
| Export Backup Center files | yes | assigned tenant | assigned tenant | no | no | no | assigned tenant |

Permission rules:

- Tenant scope is checked before data load.
- Role scope is checked before action planning.
- Write gates are checked after permission and before mutation.
- Reason text is required for disable, block, policy, and bulk operations.
- SystemScanner is not a human role and must not bypass validation.

