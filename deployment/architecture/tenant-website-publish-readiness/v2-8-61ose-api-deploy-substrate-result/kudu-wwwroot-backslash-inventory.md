# Kudu WWWRoot Backslash Inventory

Inventory target:

`app-pumpkin-api-prod-centralus-001:/home/site/wwwroot`

Access method:

Kudu VFS and ZIP APIs using Azure management bearer authentication. Publishing credentials were not printed.

Inventory results:

| Check | Result |
| --- | --- |
| Top-level VFS entries | `49` |
| Top-level malformed backslash names | `0` |
| Full backup ZIP entries | `59` |
| Full backup ZIP entries containing literal backslash | `0` |

Targeted VFS probes for earlier failure examples returned HTTP `200`, but VFS normalizes those paths as accessible resources and did not prove literal malformed entries. The full Kudu backup ZIP entry inventory is the decisive cleanup input for this phase: no literal backslash entries were present.

