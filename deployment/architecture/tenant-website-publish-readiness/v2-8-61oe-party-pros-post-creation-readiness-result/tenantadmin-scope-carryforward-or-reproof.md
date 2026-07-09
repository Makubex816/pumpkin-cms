# TenantAdmin Scope Carryforward Or Reproof

TenantAdmin scope was reproved because the approved ignored secure handoff was available.

| Check | Result |
| --- | --- |
| TenantAdmin login | 200 |
| Login role | `TenantAdmin` |
| Login tenant | `party-pros-philadelphia` |
| Verify | 200 |
| Own pages read | 200 |
| Own pages count | 3 |
| Ice pages with TenantAdmin token | 403 |
| Admin users surface with TenantAdmin token | 403 |
| Other tenant read with TenantAdmin token | 403 |

The TenantAdmin credential value was not printed or written to the repo.

