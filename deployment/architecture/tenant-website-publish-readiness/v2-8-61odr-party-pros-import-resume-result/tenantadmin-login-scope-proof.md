# TenantAdmin Login Scope Proof

Party Pros TenantAdmin login was proved using the approved secure handoff. The credential value was not printed or written to repo.

| Check | Result |
| --- | --- |
| Login status | 200 |
| Login role | `TenantAdmin` |
| Login tenant | `party-pros-philadelphia` |
| Verify status | 200 |
| Verify role | `TenantAdmin` |
| Verify tenant | `party-pros-philadelphia` |
| Own tenant pages status | 200 |
| Own tenant pages count | 3 |
| Ice pages with TenantAdmin token | 403 |
| Admin users surface with TenantAdmin token | 403 |
| Other tenant read with TenantAdmin token | 403 |

TenantAdmin scope remained tenant-bound.

